#![warn(
unreachable_pub,
trivial_casts,
trivial_numeric_casts,
unused_extern_crates,
rust_2018_idioms
)]

use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use web_sys::{WebGl2RenderingContext, WebGlProgram, WebGlShader};
use web_sys::console;

pub mod solver;

const DAM_PARTICLES: usize = 75 * 75;
const MAX_BLOCKS: usize = 50;
const BLOCK_PARTICLES: usize = 500;
const MAX_PARTICLES: usize = DAM_PARTICLES + MAX_BLOCKS * BLOCK_PARTICLES;
const POINT_SIZE: f32 = 5.0;

#[wasm_bindgen]
pub struct Simulation {
    context: WebGl2RenderingContext,
    state: solver::State,
}

#[wasm_bindgen]
impl Simulation {
    #[wasm_bindgen(constructor)]
    pub fn new(canvas: &web_sys::HtmlCanvasElement) -> Result<Simulation, JsValue> {
        let context = init_webgl(canvas)?;
        let mut state = solver::State::new();
        state.init_dam_break(DAM_PARTICLES);
        Ok(Simulation { context, state })
    }

    #[wasm_bindgen]
    pub fn get_num_particles(&self) -> usize {
        self.state.particles.len()
    }

    #[wasm_bindgen]
    pub fn step(&mut self) {
        self.state.update();
        self.draw();
    }

    #[wasm_bindgen]
    pub fn add_block(&mut self) {
        if self.get_num_particles() < MAX_PARTICLES - BLOCK_PARTICLES {
            self.state.init_block(BLOCK_PARTICLES);
        }
    }

    #[wasm_bindgen]
    pub fn reset(&mut self) {
        self.state.particles.clear();
        self.state.init_dam_break(DAM_PARTICLES);
    }

    fn draw(&self) {
        let vertices: Vec<f32> = self
            .state
            .particles
            .iter()
            .map(|p| p.to_array())
            .flatten()
            .collect();
        unsafe {
            // Note that `Float32Array::view` is somewhat dangerous (hence the
            // `unsafe`!). This is creating a raw view into our module's
            // `WebAssembly.Memory` buffer, but if we allocate more pages for ourself
            // (aka do a memory allocation in Rust) it'll cause the buffer to change,
            // causing the `Float32Array` to be invalid.
            //
            // As a result, after `Float32Array::view` we have to be very careful not to
            // do any memory allocations before it's dropped.
            let view = js_sys::Float32Array::view(&vertices);

            self.context.buffer_data_with_array_buffer_view(
                WebGl2RenderingContext::ARRAY_BUFFER,
                &view,
                WebGl2RenderingContext::DYNAMIC_DRAW,
            );
        }

        let vert_count = self.state.particles.len() as i32;
        self.context.clear(WebGl2RenderingContext::COLOR_BUFFER_BIT);
        self.context.draw_arrays(WebGl2RenderingContext::POINTS, 0, vert_count);
    }
}

fn init_webgl(canvas: &web_sys::HtmlCanvasElement) -> Result<WebGl2RenderingContext, JsValue> {
    // set up canvas and webgl context handle
    canvas.set_width(solver::WINDOW_WIDTH);
    canvas.set_height(solver::WINDOW_HEIGHT);
    let context = canvas
        .get_context("webgl2")?
        .unwrap()
        .dyn_into::<WebGl2RenderingContext>()?;

    context.clear_color(0.9, 0.9, 0.9, 1.0);

    let vert_shader = compile_shader(
        &context,
        WebGl2RenderingContext::VERTEX_SHADER,
        format!(
            r##"#version 300 es
        precision highp float;
        uniform mat4 matrix;
        in vec2 position;
        in vec3 color;
        out vec3 v_color;
        void main() {{
            gl_PointSize = {:.1};
            gl_Position = matrix * vec4(position, 0.0, 1.0);
            v_color = color;
        }}
        "##,
            POINT_SIZE
        )
            .as_str(),
    )?;

    let frag_shader = compile_shader(
        &context,
        WebGl2RenderingContext::FRAGMENT_SHADER,
        r##"#version 300 es
        precision highp float;
        in vec3 v_color;
        out vec4 fragColor;
        void main() {{
            fragColor = vec4(v_color, 1.0);
        }}
        "##,
    )?;
    let program = link_program(&context, &vert_shader, &frag_shader)?;
    context.use_program(Some(&program));

    // uniforms
    let uniform_location = context
        .get_uniform_location(&program, "matrix")
        .expect("Unable to get shader projection matrix uniform location");
    let ortho_matrix = cgmath::ortho(0.0, solver::VIEW_WIDTH, 0.0, solver::VIEW_HEIGHT, 0.0, 1.0);
    console::log_1(&format!("ortho_matrix: {:?}", ortho_matrix).into());

    let ortho_matrix_flattened_ref: &[f32; 16] = ortho_matrix.as_ref();
    context.uniform_matrix4fv_with_f32_array(
        Some(&uniform_location),
        false,
        ortho_matrix_flattened_ref,
    );


    let buffer = context.create_buffer().ok_or("Failed to create buffer")?;
    context.bind_buffer(WebGl2RenderingContext::ARRAY_BUFFER, Some(&buffer));

    // attributes
    let position_attribute_location = context.get_attrib_location(&program, "position") as u32;
    let color_attribute_location = context.get_attrib_location(&program, "color") as u32;

    context.enable_vertex_attrib_array(position_attribute_location);
    context.enable_vertex_attrib_array(color_attribute_location);

    let offset = std::mem::size_of::<js_sys::Float32Array>() as i32;
    let stride = 5 * offset;
    context.vertex_attrib_pointer_with_i32(position_attribute_location, 2, WebGl2RenderingContext::FLOAT, false, stride, 0);
    context.vertex_attrib_pointer_with_i32(color_attribute_location, 3, WebGl2RenderingContext::FLOAT, false, stride, 2 * offset);



    // allocate vertex buffer initial state
    let zeroed = vec![0.0; MAX_PARTICLES * 5];
    console::log_1(&"allocate vertex buffer initial state".into());

    unsafe {
        let positions_array_buf_view = js_sys::Float32Array::view(&zeroed);

        context.buffer_data_with_array_buffer_view(
            WebGl2RenderingContext::ARRAY_BUFFER,
            &positions_array_buf_view,
            WebGl2RenderingContext::DYNAMIC_DRAW,
        );
    }
    console::log_1(&"allocate vertex buffer initial state success".into());
    Ok(context)
}

fn compile_shader(
    context: &WebGl2RenderingContext,
    shader_type: u32,
    source: &str,
) -> Result<WebGlShader, String> {
    let shader = context
        .create_shader(shader_type)
        .ok_or_else(|| String::from("Unable to create shader object"))?;
    context.shader_source(&shader, source);
    context.compile_shader(&shader);

    if context
        .get_shader_parameter(&shader, WebGl2RenderingContext::COMPILE_STATUS)
        .as_bool()
        .unwrap_or(false)
    {
        Ok(shader)
    } else {
        Err(context
            .get_shader_info_log(&shader)
            .unwrap_or_else(|| String::from("Unknown error creating shader")))
    }
}

fn link_program(
    context: &WebGl2RenderingContext,
    vert_shader: &WebGlShader,
    frag_shader: &WebGlShader,
) -> Result<WebGlProgram, String> {
    let program = context
        .create_program()
        .ok_or_else(|| String::from("Unable to create shader object"))?;

    context.attach_shader(&program, vert_shader);
    context.attach_shader(&program, frag_shader);
    context.link_program(&program);

    if context
        .get_program_parameter(&program, WebGl2RenderingContext::LINK_STATUS)
        .as_bool()
        .unwrap_or(false)
    {
        Ok(program)
    } else {
        Err(context
            .get_program_info_log(&program)
            .unwrap_or_else(|| String::from("Unknown error creating program object")))
    }
}
