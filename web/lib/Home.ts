/* generated by Svelte v3.55.1 */
import {
	SvelteComponent,
	append_styles,
	attr,
	detach,
	element,
	init,
	insert,
	noop,
	safe_not_equal
} from "svelte/internal";

function add_css(target) {
	append_styles(target, "svelte-1u6xn52", ".box.svelte-1u6xn52.svelte-1u6xn52{position:fixed;border:1px solid var(--welllt);width:min-content;font:14px var(--ff);color:var(--pri);background:var(--bgsec)\n    }.box.svelte-1u6xn52 .svelte-1u6xn52{vertical-align:middle;margin:0;font:inherit\n    }.box.svelte-1u6xn52>.head.svelte-1u6xn52{display:flex;white-space:pre;user-select:none;background:var(--bgpri);padding:2px;cursor:move;border-bottom:1px solid var(--welllt)\n    }.box.svelte-1u6xn52>.body.svelte-1u6xn52{padding:2px\n    }.box.svelte-1u6xn52 .title.svelte-1u6xn52{margin:0 auto 0 10px\n    }.icon.svelte-1u6xn52.svelte-1u6xn52{cursor:pointer;font:25px \"codicon\";line-height:0.9\n    }.icon.ud.svelte-1u6xn52.svelte-1u6xn52::after{content:\"\"\n    }.box.svelte-1u6xn52 .svelte-1u6xn52:is(input,select,button,textarea){color:var(--pri);outline:none;border:none;white-space:pre\n    }.box.svelte-1u6xn52 .svelte-1u6xn52:is(textarea,.log){width:100%;white-space:pre-wrap;font-size:12px;background:none;padding:0px;height:100%;overflow-y:scroll\n    }.box.svelte-1u6xn52 .svelte-1u6xn52:is(input,select){padding:3px;background:var(--well);border-bottom:1px solid var(--prilt);transition:border-bottom 250ms\n    }.box.svelte-1u6xn52 .svelte-1u6xn52:is(button,input[type=checkbox]){background:var(--button);transition:background 250ms;border:1px solid var(--well)\n    }.box.svelte-1u6xn52 .svelte-1u6xn52:is(button,input[type=checkbox]):hover{background:var(--bgsec)\n    }.box.svelte-1u6xn52 .svelte-1u6xn52:is(button,input[type=checkbox]):focus{border:1px solid var(--secdk)\n    }");
}

function create_fragment(ctx) {
	let div2;

	return {
		c() {
			div2 = element("div");

			div2.innerHTML = `<div class="head svelte-1u6xn52"><a class="icon svelte-1u6xn52">\\uea74</a> 
    <span class="title svelte-1u6xn52">Title!</span> 
    <a class="icon ud svelte-1u6xn52"></a> 
    <a class="icon close svelte-1u6xn52">\\ueab8</a></div> 
  <div class="body svelte-1u6xn52"></div>`;

			attr(div2, "class", "box svelte-1u6xn52");
		},
		m(target, anchor) {
			insert(target, div2, anchor);
		},
		p: noop,
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div2);
		}
	};
}

class Home extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, null, create_fragment, safe_not_equal, {}, add_css);
	}
}

export default Home;