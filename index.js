(()=>{var e={466:function(e){var t;e.exports=((t=function(){function e(e){return a.appendChild(e.dom),e}function n(e){for(var t=0;t<a.children.length;t++)a.children[t].style.display=t===e?"block":"none";r=e}var r=0,a=document.createElement("div");a.style.cssText="position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000",a.addEventListener("click",(function(e){e.preventDefault(),n(++r%a.children.length)}),!1);var o=(performance||Date).now(),s=o,i=0,l=e(new t.Panel("FPS","#0ff","#002")),c=e(new t.Panel("MS","#0f0","#020"));if(self.performance&&self.performance.memory)var u=e(new t.Panel("MB","#f08","#201"));return n(0),{REVISION:16,dom:a,addPanel:e,showPanel:n,begin:function(){o=(performance||Date).now()},end:function(){i++;var e=(performance||Date).now();if(c.update(e-o,200),e>s+1e3&&(l.update(1e3*i/(e-s),100),s=e,i=0,u)){var t=performance.memory;u.update(t.usedJSHeapSize/1048576,t.jsHeapSizeLimit/1048576)}return e},update:function(){o=this.end()},domElement:a,setMode:n}}).Panel=function(e,t,n){var r=1/0,a=0,o=Math.round,s=o(window.devicePixelRatio||1),i=80*s,l=48*s,c=3*s,u=2*s,d=3*s,p=15*s,f=74*s,m=30*s,h=document.createElement("canvas");h.width=i,h.height=l,h.style.cssText="width:80px;height:48px";var y=h.getContext("2d");return y.font="bold "+9*s+"px Helvetica,Arial,sans-serif",y.textBaseline="top",y.fillStyle=n,y.fillRect(0,0,i,l),y.fillStyle=t,y.fillText(e,c,u),y.fillRect(d,p,f,m),y.fillStyle=n,y.globalAlpha=.9,y.fillRect(d,p,f,m),{dom:h,update:function(l,g){r=Math.min(r,l),a=Math.max(a,l),y.fillStyle=n,y.globalAlpha=1,y.fillRect(0,0,i,p),y.fillStyle=t,y.fillText(o(l)+" "+e+" ("+o(r)+"-"+o(a)+")",c,u),y.drawImage(h,d+s,p,f-s,m,d,p,f-s,m),y.fillRect(d+f-s,p,s,m),y.fillStyle=n,y.globalAlpha=.9,y.fillRect(d+f-s,p,s,o((1-l/g)*m))}}},t)}},t={};function n(r){var a=t[r];if(void 0!==a)return a.exports;var o=t[r]={exports:{}};return e[r].call(o.exports,o,o.exports,n),o.exports}n.m=e,n.u=e=>e+".index.js",n.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{var e;n.g.importScripts&&(e=n.g.location+"");var t=n.g.document;if(!e&&t&&(t.currentScript&&(e=t.currentScript.src),!e)){var r=t.getElementsByTagName("script");r.length&&(e=r[r.length-1].src)}if(!e)throw new Error("Automatic publicPath is not supported in this browser");e=e.replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"),n.p=e})(),n.b=document.baseURI||self.location.href,(()=>{"use strict";const e=Symbol("Comlink.proxy"),t=Symbol("Comlink.endpoint"),r=Symbol("Comlink.releaseProxy"),a=Symbol("Comlink.thrown"),o=e=>"object"==typeof e&&null!==e||"function"==typeof e,s=new Map([["proxy",{canHandle:t=>o(t)&&t[e],serialize(e){const{port1:t,port2:n}=new MessageChannel;return i(e,t),[n,[n]]},deserialize:e=>(e.start(),c(e))}],["throw",{canHandle:e=>o(e)&&a in e,serialize({value:e}){let t;return t=e instanceof Error?{isError:!0,value:{message:e.message,name:e.name,stack:e.stack}}:{isError:!1,value:e},[t,[]]},deserialize(e){if(e.isError)throw Object.assign(new Error(e.value.message),e.value);throw e.value}}]]);function i(e,t=self){t.addEventListener("message",(function n(r){if(!r||!r.data)return;const{id:o,type:s,path:c}=Object.assign({path:[]},r.data),u=(r.data.argumentList||[]).map(g);let d;try{const t=c.slice(0,-1).reduce(((e,t)=>e[t]),e),n=c.reduce(((e,t)=>e[t]),e);switch(s){case"GET":d=n;break;case"SET":t[c.slice(-1)[0]]=g(r.data.value),d=!0;break;case"APPLY":d=n.apply(t,u);break;case"CONSTRUCT":d=h(new n(...u));break;case"ENDPOINT":{const{port1:t,port2:n}=new MessageChannel;i(e,n),d=m(t,[t])}break;case"RELEASE":d=void 0;break;default:return}}catch(e){d={value:e,[a]:0}}Promise.resolve(d).catch((e=>({value:e,[a]:0}))).then((e=>{const[r,a]=y(e);t.postMessage(Object.assign(Object.assign({},r),{id:o}),a),"RELEASE"===s&&(t.removeEventListener("message",n),l(t))}))})),t.start&&t.start()}function l(e){(function(e){return"MessagePort"===e.constructor.name})(e)&&e.close()}function c(e,t){return d(e,[],t)}function u(e){if(e)throw new Error("Proxy has been released and is not useable")}function d(e,n=[],a=function(){}){let o=!1;const s=new Proxy(a,{get(t,a){if(u(o),a===r)return()=>v(e,{type:"RELEASE",path:n.map((e=>e.toString()))}).then((()=>{l(e),o=!0}));if("then"===a){if(0===n.length)return{then:()=>s};const t=v(e,{type:"GET",path:n.map((e=>e.toString()))}).then(g);return t.then.bind(t)}return d(e,[...n,a])},set(t,r,a){u(o);const[s,i]=y(a);return v(e,{type:"SET",path:[...n,r].map((e=>e.toString())),value:s},i).then(g)},apply(r,a,s){u(o);const i=n[n.length-1];if(i===t)return v(e,{type:"ENDPOINT"}).then(g);if("bind"===i)return d(e,n.slice(0,-1));const[l,c]=p(s);return v(e,{type:"APPLY",path:n.map((e=>e.toString())),argumentList:l},c).then(g)},construct(t,r){u(o);const[a,s]=p(r);return v(e,{type:"CONSTRUCT",path:n.map((e=>e.toString())),argumentList:a},s).then(g)}});return s}function p(e){const t=e.map(y);return[t.map((e=>e[0])),(n=t.map((e=>e[1])),Array.prototype.concat.apply([],n))];var n}const f=new WeakMap;function m(e,t){return f.set(e,t),e}function h(t){return Object.assign(t,{[e]:!0})}function y(e){for(const[t,n]of s)if(n.canHandle(e)){const[r,a]=n.serialize(e);return[{type:"HANDLER",name:t,value:r},a]}return[{type:"RAW",value:e},f.get(e)||[]]}function g(e){switch(e.type){case"HANDLER":return s.get(e.name).deserialize(e.value);case"RAW":return e.value}}function v(e,t,n){return new Promise((r=>{const a=new Array(4).fill(0).map((()=>Math.floor(Math.random()*Number.MAX_SAFE_INTEGER).toString(16))).join("-");e.addEventListener("message",(function t(n){n.data&&n.data.id&&n.data.id===a&&(e.removeEventListener("message",t),r(n.data))})),e.start&&e.start(),e.postMessage(Object.assign({id:a},t),n)}))}var w=n(466);(async()=>{if(!await(async e=>{try{return"undefined"!=typeof MessageChannel&&(new MessageChannel).port1.postMessage(new SharedArrayBuffer(1)),WebAssembly.validate(e)}catch(e){return!1}})(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,5,4,1,3,1,1,10,11,1,9,0,65,0,254,16,2,0,26,11]))||!HTMLCanvasElement.prototype.transferControlToOffscreen){const e="Browser does not support required features";console.error(e);const t=document.getElementById("canvas");t.style="border: 1px solid red";const n=t.getContext("2d");return n.font="16px serif",void n.fillText(e,10,25)}let e=await c(new Worker(new URL(n.p+n.u(588),n.b),{type:void 0})).handlers,t=await e.numThreads;const r=new w;r.dom.style.position="absolute",document.getElementById("stats").appendChild(r.dom);const a=e=>{document.getElementById("info").innerText=`Threads: ${t}, Particles: ${e}\t\t`},o=document.getElementById("canvas").transferControlToOffscreen(),s=await e.init(m(o,[o]),h(r));a(s),document.getElementById("block").addEventListener("click",(async()=>{const t=await e.addBlock();a(t)})),document.getElementById("reset").addEventListener("click",(async()=>{const t=await e.reset();a(t)}))})()})()})();