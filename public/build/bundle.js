
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.4' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\components\listArticles.svelte generated by Svelte v3.46.4 */

    const { console: console_1 } = globals;
    const file$1 = "src\\components\\listArticles.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[29] = list[i];
    	child_ctx[30] = list;
    	child_ctx[31] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[32] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[35] = list[i];
    	return child_ctx;
    }

    // (115:12) {#if item.keywords}
    function create_if_block_3(ctx) {
    	let ul;
    	let each_value_2 = /*item*/ ctx[32].keywords;
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "keywords");
    			add_location(ul, file$1, 115, 16, 2863);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*listArticles*/ 1) {
    				each_value_2 = /*item*/ ctx[32].keywords;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(115:12) {#if item.keywords}",
    		ctx
    	});

    	return block;
    }

    // (117:20) {#each item.keywords as keyword}
    function create_each_block_2(ctx) {
    	let li;
    	let t_value = /*keyword*/ ctx[35] + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			add_location(li, file$1, 117, 24, 2964);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*listArticles*/ 1 && t_value !== (t_value = /*keyword*/ ctx[35] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(117:20) {#each item.keywords as keyword}",
    		ctx
    	});

    	return block;
    }

    // (109:0) {#each listArticles as item}
    function create_each_block_1(ctx) {
    	let li;
    	let h2;
    	let t0_value = /*item*/ ctx[32].title + "";
    	let t0;
    	let t1;
    	let p;
    	let t2_value = /*item*/ ctx[32].description + "";
    	let t2;
    	let t3;
    	let div1;
    	let t4;
    	let div0;
    	let button0;
    	let svg0;
    	let path0;
    	let t5;
    	let button1;
    	let svg1;
    	let path1;
    	let t6;
    	let button2;
    	let svg2;
    	let path2;
    	let t7;
    	let li_id_value;
    	let mounted;
    	let dispose;
    	let if_block = /*item*/ ctx[32].keywords && create_if_block_3(ctx);

    	function click_handler() {
    		return /*click_handler*/ ctx[11](/*item*/ ctx[32]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();
    			p = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			div1 = element("div");
    			if (if_block) if_block.c();
    			t4 = space();
    			div0 = element("div");
    			button0 = element("button");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t5 = space();
    			button1 = element("button");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t6 = space();
    			button2 = element("button");
    			svg2 = svg_element("svg");
    			path2 = svg_element("path");
    			t7 = space();
    			add_location(h2, file$1, 111, 8, 2723);
    			add_location(p, file$1, 112, 8, 2754);
    			attr_dev(path0, "d", "M 15 2 C 11.145666 2 8 5.1456661 8 9 L 8 11 L 6 11 C 4.895 11 4 11.895 4 13 L 4 25 C 4 26.105 4.895 27 6 27 L 24 27 C 25.105 27 26 26.105 26 25 L 26 13 C 26 11.895 25.105 11 24 11 L 22 11 L 22 9 C 22 5.2715823 19.036581 2.2685653 15.355469 2.0722656 A 1.0001 1.0001 0 0 0 15 2 z M 15 4 C 17.773666 4 20 6.2263339 20 9 L 20 11 L 10 11 L 10 9 C 10 6.2263339 12.226334 4 15 4 z");
    			add_location(path0, file$1, 123, 82, 3250);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 30 30");
    			add_location(svg0, file$1, 123, 20, 3188);
    			attr_dev(button0, "class", "button lock");
    			add_location(button0, file$1, 122, 16, 3106);
    			attr_dev(path1, "d", "M 18.414062 2 C 18.158188 2 17.902031 2.0974687 17.707031 2.2929688 L 16 4 L 20 8 L 21.707031 6.2929688 C 22.098031 5.9019687 22.098031 5.2689063 21.707031 4.8789062 L 19.121094 2.2929688 C 18.925594 2.0974687 18.669937 2 18.414062 2 z M 14.5 5.5 L 3 17 L 3 21 L 7 21 L 18.5 9.5 L 14.5 5.5 z");
    			add_location(path1, file$1, 126, 82, 3884);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 24 24");
    			add_location(svg1, file$1, 126, 20, 3822);
    			attr_dev(button1, "class", "button edit");
    			add_location(button1, file$1, 125, 16, 3715);
    			attr_dev(path2, "d", "M 10.806641 2 C 10.289641 2 9.7956875 2.2043125 9.4296875 2.5703125 L 9 3 L 4 3 A 1.0001 1.0001 0 1 0 4 5 L 20 5 A 1.0001 1.0001 0 1 0 20 3 L 15 3 L 14.570312 2.5703125 C 14.205312 2.2043125 13.710359 2 13.193359 2 L 10.806641 2 z M 4.3652344 7 L 5.8925781 20.263672 C 6.0245781 21.253672 6.877 22 7.875 22 L 16.123047 22 C 17.121047 22 17.974422 21.254859 18.107422 20.255859 L 19.634766 7 L 4.3652344 7 z");
    			add_location(path2, file$1, 129, 80, 4384);
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "viewBox", "0 0 24 24");
    			add_location(svg2, file$1, 129, 20, 4324);
    			attr_dev(button2, "class", "button delete");
    			add_location(button2, file$1, 128, 16, 4238);
    			attr_dev(div0, "class", "buttons");
    			add_location(div0, file$1, 121, 12, 3067);
    			attr_dev(div1, "class", "note-foot");
    			add_location(div1, file$1, 113, 8, 2789);
    			attr_dev(li, "class", "note");
    			attr_dev(li, "id", li_id_value = /*item*/ ctx[32].id);
    			add_location(li, file$1, 110, 4, 2681);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, h2);
    			append_dev(h2, t0);
    			append_dev(li, t1);
    			append_dev(li, p);
    			append_dev(p, t2);
    			append_dev(li, t3);
    			append_dev(li, div1);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t4);
    			append_dev(div1, div0);
    			append_dev(div0, button0);
    			append_dev(button0, svg0);
    			append_dev(svg0, path0);
    			append_dev(div0, t5);
    			append_dev(div0, button1);
    			append_dev(button1, svg1);
    			append_dev(svg1, path1);
    			append_dev(div0, t6);
    			append_dev(div0, button2);
    			append_dev(button2, svg2);
    			append_dev(svg2, path2);
    			append_dev(li, t7);

    			if (!mounted) {
    				dispose = [
    					listen_dev(
    						button0,
    						"click",
    						function () {
    							if (is_function(/*deleteModal*/ ctx[7](/*item*/ ctx[32].id))) /*deleteModal*/ ctx[7](/*item*/ ctx[32].id).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(button1, "click", click_handler, false, false, false),
    					listen_dev(
    						button2,
    						"click",
    						function () {
    							if (is_function(/*deleteArticle*/ ctx[10](/*item*/ ctx[32].id))) /*deleteArticle*/ ctx[10](/*item*/ ctx[32].id).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*listArticles*/ 1 && t0_value !== (t0_value = /*item*/ ctx[32].title + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*listArticles*/ 1 && t2_value !== (t2_value = /*item*/ ctx[32].description + "")) set_data_dev(t2, t2_value);

    			if (/*item*/ ctx[32].keywords) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_3(ctx);
    					if_block.c();
    					if_block.m(div1, t4);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty[0] & /*listArticles*/ 1 && li_id_value !== (li_id_value = /*item*/ ctx[32].id)) {
    				attr_dev(li, "id", li_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(109:0) {#each listArticles as item}",
    		ctx
    	});

    	return block;
    }

    // (141:0) {#if modalAdd }
    function create_if_block_2(ctx) {
    	let form;
    	let div0;
    	let t0;
    	let div4;
    	let div3;
    	let div1;
    	let t1;
    	let h2;
    	let t3;
    	let h30;
    	let t5;
    	let span0;
    	let input;
    	let t6;
    	let h31;
    	let t8;
    	let span1;
    	let textarea0;
    	let t9;
    	let h32;
    	let t11;
    	let span2;
    	let textarea1;
    	let t12;
    	let h33;
    	let t14;
    	let span3;
    	let t15;
    	let div2;
    	let button0;
    	let t17;
    	let button1;
    	let mounted;
    	let dispose;
    	let each_value = /*categories*/ ctx[6];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			form = element("form");
    			div0 = element("div");
    			t0 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			t1 = space();
    			h2 = element("h2");
    			h2.textContent = "Ajouter une note";
    			t3 = space();
    			h30 = element("h3");
    			h30.textContent = "Le titre:";
    			t5 = space();
    			span0 = element("span");
    			input = element("input");
    			t6 = space();
    			h31 = element("h3");
    			h31.textContent = "Le texte:";
    			t8 = space();
    			span1 = element("span");
    			textarea0 = element("textarea");
    			t9 = space();
    			h32 = element("h3");
    			h32.textContent = "Ajouter les mots-clefs:";
    			t11 = space();
    			span2 = element("span");
    			textarea1 = element("textarea");
    			t12 = space();
    			h33 = element("h3");
    			h33.textContent = "Ajouter des catégories:";
    			t14 = space();
    			span3 = element("span");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t15 = space();
    			div2 = element("div");
    			button0 = element("button");
    			button0.textContent = "Annuler";
    			t17 = space();
    			button1 = element("button");
    			button1.textContent = "Ajouter";
    			attr_dev(div0, "class", "modal-bg close-modal");
    			add_location(div0, file$1, 143, 8, 5155);
    			attr_dev(div1, "class", "icon-close close-modal");
    			add_location(div1, file$1, 146, 16, 5323);
    			attr_dev(h2, "class", "modal-h2");
    			add_location(h2, file$1, 147, 16, 5420);
    			attr_dev(h30, "class", "modal-h3");
    			add_location(h30, file$1, 148, 16, 5480);
    			attr_dev(input, "type", "text");
    			input.required = true;
    			add_location(input, file$1, 150, 20, 5574);
    			attr_dev(span0, "class", "text");
    			add_location(span0, file$1, 149, 16, 5533);
    			attr_dev(h31, "class", "modal-h3");
    			add_location(h31, file$1, 152, 16, 5672);
    			attr_dev(textarea0, "name", "note");
    			textarea0.required = true;
    			add_location(textarea0, file$1, 154, 20, 5766);
    			attr_dev(span1, "class", "text");
    			add_location(span1, file$1, 153, 16, 5725);
    			attr_dev(h32, "class", "modal-h3");
    			add_location(h32, file$1, 156, 16, 5884);
    			attr_dev(textarea1, "name", "keywords");
    			attr_dev(textarea1, "placeholder", "Ecrire les mots clefs séparés par une vigurle");
    			add_location(textarea1, file$1, 158, 20, 6003);
    			attr_dev(span2, "class", "text text-small");
    			add_location(span2, file$1, 157, 16, 5951);
    			attr_dev(h33, "class", "modal-h3");
    			add_location(h33, file$1, 160, 16, 6173);
    			attr_dev(span3, "class", "categories");
    			add_location(span3, file$1, 161, 16, 6240);
    			attr_dev(button0, "class", "button button-large");
    			add_location(button0, file$1, 170, 20, 6625);
    			attr_dev(button1, "type", "submit");
    			attr_dev(button1, "class", "button button-large");
    			add_location(button1, file$1, 171, 20, 6736);
    			attr_dev(div2, "class", "modal-foot");
    			add_location(div2, file$1, 169, 16, 6579);
    			attr_dev(div3, "class", "modal-wrap");
    			add_location(div3, file$1, 145, 12, 5281);
    			attr_dev(div4, "class", "modal-inner");
    			add_location(div4, file$1, 144, 8, 5242);
    			attr_dev(form, "class", "modal modal-add");
    			add_location(form, file$1, 142, 4, 5073);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, div0);
    			append_dev(form, t0);
    			append_dev(form, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div3, t1);
    			append_dev(div3, h2);
    			append_dev(div3, t3);
    			append_dev(div3, h30);
    			append_dev(div3, t5);
    			append_dev(div3, span0);
    			append_dev(span0, input);
    			set_input_value(input, /*article*/ ctx[5].title);
    			append_dev(div3, t6);
    			append_dev(div3, h31);
    			append_dev(div3, t8);
    			append_dev(div3, span1);
    			append_dev(span1, textarea0);
    			set_input_value(textarea0, /*article*/ ctx[5].description);
    			append_dev(div3, t9);
    			append_dev(div3, h32);
    			append_dev(div3, t11);
    			append_dev(div3, span2);
    			append_dev(span2, textarea1);
    			set_input_value(textarea1, /*article*/ ctx[5].keywords);
    			append_dev(div3, t12);
    			append_dev(div3, h33);
    			append_dev(div3, t14);
    			append_dev(div3, span3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(span3, null);
    			}

    			append_dev(div3, t15);
    			append_dev(div3, div2);
    			append_dev(div2, button0);
    			append_dev(div2, t17);
    			append_dev(div2, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler_2*/ ctx[13], false, false, false),
    					listen_dev(div1, "click", /*click_handler_3*/ ctx[14], false, false, false),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[15]),
    					listen_dev(textarea0, "input", /*textarea0_input_handler*/ ctx[16]),
    					listen_dev(textarea1, "input", /*textarea1_input_handler*/ ctx[17]),
    					listen_dev(button0, "click", /*click_handler_4*/ ctx[19], false, false, false),
    					listen_dev(form, "submit", prevent_default(/*createArticle*/ ctx[8]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*article*/ 32 && input.value !== /*article*/ ctx[5].title) {
    				set_input_value(input, /*article*/ ctx[5].title);
    			}

    			if (dirty[0] & /*article*/ 32) {
    				set_input_value(textarea0, /*article*/ ctx[5].description);
    			}

    			if (dirty[0] & /*article*/ 32) {
    				set_input_value(textarea1, /*article*/ ctx[5].keywords);
    			}

    			if (dirty[0] & /*categories*/ 64) {
    				each_value = /*categories*/ ctx[6];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(span3, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(141:0) {#if modalAdd }",
    		ctx
    	});

    	return block;
    }

    // (163:20) {#each categories as category}
    function create_each_block(ctx) {
    	let label;
    	let input;
    	let t0;
    	let span;
    	let t1_value = /*category*/ ctx[29].title + "";
    	let t1;
    	let t2;
    	let mounted;
    	let dispose;

    	function input_change_handler() {
    		/*input_change_handler*/ ctx[18].call(input, /*each_value*/ ctx[30], /*category_index*/ ctx[31]);
    	}

    	const block = {
    		c: function create() {
    			label = element("label");
    			input = element("input");
    			t0 = space();
    			span = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(input, "type", "checkbox");
    			add_location(input, file$1, 164, 24, 6372);
    			add_location(span, file$1, 165, 24, 6448);
    			add_location(label, file$1, 163, 20, 6339);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			input.checked = /*category*/ ctx[29].id;
    			append_dev(label, t0);
    			append_dev(label, span);
    			append_dev(span, t1);
    			append_dev(label, t2);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", input_change_handler);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*categories*/ 64) {
    				input.checked = /*category*/ ctx[29].id;
    			}

    			if (dirty[0] & /*categories*/ 64 && t1_value !== (t1_value = /*category*/ ctx[29].title + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(163:20) {#each categories as category}",
    		ctx
    	});

    	return block;
    }

    // (180:0) {#if modalEdit}
    function create_if_block_1(ctx) {
    	let form;
    	let div0;
    	let t0;
    	let div4;
    	let div3;
    	let div1;
    	let t1;
    	let h2;
    	let t3;
    	let h30;
    	let t5;
    	let span0;
    	let input0;
    	let t6;
    	let h31;
    	let t8;
    	let span1;
    	let textarea0;
    	let t9;
    	let h32;
    	let t11;
    	let span2;
    	let textarea1;
    	let t12;
    	let h33;
    	let t14;
    	let span4;
    	let label;
    	let input1;
    	let t15;
    	let span3;
    	let t17;
    	let div2;
    	let button0;
    	let t19;
    	let button1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			form = element("form");
    			div0 = element("div");
    			t0 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			t1 = space();
    			h2 = element("h2");
    			h2.textContent = "Modifier une note";
    			t3 = space();
    			h30 = element("h3");
    			h30.textContent = "Le titre:";
    			t5 = space();
    			span0 = element("span");
    			input0 = element("input");
    			t6 = space();
    			h31 = element("h3");
    			h31.textContent = "Le texte:";
    			t8 = space();
    			span1 = element("span");
    			textarea0 = element("textarea");
    			t9 = space();
    			h32 = element("h3");
    			h32.textContent = "Ajouter les mots-clefs:";
    			t11 = space();
    			span2 = element("span");
    			textarea1 = element("textarea");
    			t12 = space();
    			h33 = element("h3");
    			h33.textContent = "Ajouter des catégories:";
    			t14 = space();
    			span4 = element("span");
    			label = element("label");
    			input1 = element("input");
    			t15 = space();
    			span3 = element("span");
    			span3.textContent = "Catégorie 1";
    			t17 = space();
    			div2 = element("div");
    			button0 = element("button");
    			button0.textContent = "Annuler";
    			t19 = space();
    			button1 = element("button");
    			button1.textContent = "Ajouter";
    			attr_dev(div0, "class", "modal-bg");
    			add_location(div0, file$1, 182, 4, 6994);
    			attr_dev(div1, "class", "icon-close");
    			add_location(div1, file$1, 185, 12, 7138);
    			attr_dev(h2, "class", "modal-h2");
    			add_location(h2, file$1, 186, 12, 7220);
    			attr_dev(h30, "class", "modal-h3");
    			add_location(h30, file$1, 187, 12, 7277);
    			attr_dev(input0, "type", "text");
    			input0.required = true;
    			add_location(input0, file$1, 189, 20, 7371);
    			attr_dev(span0, "class", "text");
    			add_location(span0, file$1, 188, 16, 7330);
    			attr_dev(h31, "class", "modal-h3");
    			add_location(h31, file$1, 191, 12, 7472);
    			attr_dev(textarea0, "name", "note");
    			attr_dev(textarea0, "placeholder", "Ecrire votre note...");
    			textarea0.required = true;
    			add_location(textarea0, file$1, 193, 16, 7558);
    			attr_dev(span1, "class", "text");
    			add_location(span1, file$1, 192, 12, 7521);
    			attr_dev(h32, "class", "modal-h3");
    			add_location(h32, file$1, 195, 12, 7710);
    			attr_dev(textarea1, "name", "keywords");
    			attr_dev(textarea1, "placeholder", "Ecrire les mots clefs séparés par une vigurle");
    			add_location(textarea1, file$1, 197, 16, 7821);
    			attr_dev(span2, "class", "text text-small");
    			add_location(span2, file$1, 196, 12, 7773);
    			attr_dev(h33, "class", "modal-h3");
    			add_location(h33, file$1, 199, 12, 7991);
    			attr_dev(input1, "type", "checkbox");
    			attr_dev(input1, "name", "category");
    			input1.value = "categorie-1";
    			add_location(input1, file$1, 202, 20, 8126);
    			add_location(span3, file$1, 203, 20, 8207);
    			add_location(label, file$1, 201, 16, 8097);
    			attr_dev(span4, "class", "categories");
    			add_location(span4, file$1, 200, 12, 8054);
    			attr_dev(button0, "class", "button button-large");
    			add_location(button0, file$1, 207, 16, 8334);
    			attr_dev(button1, "type", "submit");
    			attr_dev(button1, "class", "button button-large");
    			add_location(button1, file$1, 208, 16, 8442);
    			attr_dev(div2, "class", "modal-foot");
    			add_location(div2, file$1, 206, 12, 8292);
    			attr_dev(div3, "class", "modal-wrap");
    			add_location(div3, file$1, 184, 7, 7100);
    			attr_dev(div4, "class", "modal-inner");
    			add_location(div4, file$1, 183, 4, 7066);
    			attr_dev(form, "class", "modal modal-edit");
    			add_location(form, file$1, 181, 0, 6915);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, div0);
    			append_dev(form, t0);
    			append_dev(form, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div3, t1);
    			append_dev(div3, h2);
    			append_dev(div3, t3);
    			append_dev(div3, h30);
    			append_dev(div3, t5);
    			append_dev(div3, span0);
    			append_dev(span0, input0);
    			set_input_value(input0, /*updatedArticle*/ ctx[4].title);
    			append_dev(div3, t6);
    			append_dev(div3, h31);
    			append_dev(div3, t8);
    			append_dev(div3, span1);
    			append_dev(span1, textarea0);
    			set_input_value(textarea0, /*updatedArticle*/ ctx[4].description);
    			append_dev(div3, t9);
    			append_dev(div3, h32);
    			append_dev(div3, t11);
    			append_dev(div3, span2);
    			append_dev(span2, textarea1);
    			set_input_value(textarea1, /*updatedArticle*/ ctx[4].keywords);
    			append_dev(div3, t12);
    			append_dev(div3, h33);
    			append_dev(div3, t14);
    			append_dev(div3, span4);
    			append_dev(span4, label);
    			append_dev(label, input1);
    			append_dev(label, t15);
    			append_dev(label, span3);
    			append_dev(div3, t17);
    			append_dev(div3, div2);
    			append_dev(div2, button0);
    			append_dev(div2, t19);
    			append_dev(div2, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler_5*/ ctx[20], false, false, false),
    					listen_dev(div1, "click", /*click_handler_6*/ ctx[21], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[22]),
    					listen_dev(textarea0, "input", /*textarea0_input_handler_1*/ ctx[23]),
    					listen_dev(textarea1, "input", /*textarea1_input_handler_1*/ ctx[24]),
    					listen_dev(button0, "click", /*click_handler_7*/ ctx[25], false, false, false),
    					listen_dev(form, "submit", prevent_default(/*updateArticle*/ ctx[9]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*updatedArticle*/ 16 && input0.value !== /*updatedArticle*/ ctx[4].title) {
    				set_input_value(input0, /*updatedArticle*/ ctx[4].title);
    			}

    			if (dirty[0] & /*updatedArticle*/ 16) {
    				set_input_value(textarea0, /*updatedArticle*/ ctx[4].description);
    			}

    			if (dirty[0] & /*updatedArticle*/ 16) {
    				set_input_value(textarea1, /*updatedArticle*/ ctx[4].keywords);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(180:0) {#if modalEdit}",
    		ctx
    	});

    	return block;
    }

    // (217:0) {#if modalDelete}
    function create_if_block(ctx) {
    	let div5;
    	let div0;
    	let t0;
    	let div4;
    	let div3;
    	let div1;
    	let t1;
    	let span;
    	let t3;
    	let div2;
    	let button0;
    	let t5;
    	let button1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			t1 = space();
    			span = element("span");
    			span.textContent = "Etes-vous sur de vouloir supprimer la note ?";
    			t3 = space();
    			div2 = element("div");
    			button0 = element("button");
    			button0.textContent = "Annuler";
    			t5 = space();
    			button1 = element("button");
    			button1.textContent = "Supprimer";
    			attr_dev(div0, "class", "modal-bg");
    			add_location(div0, file$1, 219, 8, 8644);
    			attr_dev(div1, "class", "icon-close close-modal");
    			add_location(div1, file$1, 222, 16, 8804);
    			attr_dev(span, "class", "text");
    			add_location(span, file$1, 223, 16, 8864);
    			attr_dev(button0, "class", "button button-large");
    			add_location(button0, file$1, 227, 20, 9038);
    			attr_dev(button1, "class", "button button-large");
    			add_location(button1, file$1, 228, 20, 9152);
    			attr_dev(div2, "class", "modal-foot");
    			add_location(div2, file$1, 226, 16, 8992);
    			attr_dev(div3, "class", "modal-wrap");
    			add_location(div3, file$1, 221, 12, 8762);
    			attr_dev(div4, "class", "modal-inner");
    			add_location(div4, file$1, 220, 8, 8723);
    			attr_dev(div5, "class", "modal modal-delete");
    			add_location(div5, file$1, 218, 4, 8602);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div0);
    			append_dev(div5, t0);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div3, t1);
    			append_dev(div3, span);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div2, button0);
    			append_dev(div2, t5);
    			append_dev(div2, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler_8*/ ctx[26], false, false, false),
    					listen_dev(button0, "click", /*click_handler_9*/ ctx[27], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(217:0) {#if modalDelete}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let link;
    	let t0;
    	let main;
    	let ul;
    	let t1;
    	let div;
    	let img;
    	let img_src_value;
    	let t2;
    	let t3;
    	let t4;
    	let if_block2_anchor;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*listArticles*/ ctx[0];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let if_block0 = /*modalAdd*/ ctx[1] && create_if_block_2(ctx);
    	let if_block1 = /*modalEdit*/ ctx[2] && create_if_block_1(ctx);
    	let if_block2 = /*modalDelete*/ ctx[3] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			link = element("link");
    			t0 = space();
    			main = element("main");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			div = element("div");
    			img = element("img");
    			t2 = space();
    			if (if_block0) if_block0.c();
    			t3 = space();
    			if (if_block1) if_block1.c();
    			t4 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "https://fonts.googleapis.com/icon?family=Material+Icons");
    			add_location(link, file$1, 0, 0, 0);
    			attr_dev(ul, "class", "notes");
    			add_location(ul, file$1, 105, 4, 2587);
    			if (!src_url_equal(img.src, img_src_value = "assets/img/add.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "plus");
    			add_location(img, file$1, 136, 58, 4986);
    			attr_dev(div, "class", "more");
    			add_location(div, file$1, 136, 4, 4932);
    			add_location(main, file$1, 104, 0, 2575);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(main, t1);
    			append_dev(main, div);
    			append_dev(div, img);
    			insert_dev(target, t2, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t4, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, if_block2_anchor, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler_1*/ ctx[12], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*listArticles, deleteArticle, modalEdit, updatedArticle, deleteModal*/ 1173) {
    				each_value_1 = /*listArticles*/ ctx[0];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (/*modalAdd*/ ctx[1]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					if_block0.m(t3.parentNode, t3);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*modalEdit*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					if_block1.m(t4.parentNode, t4);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*modalDelete*/ ctx[3]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block(ctx);
    					if_block2.c();
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t4);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(if_block2_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ListArticles', slots, []);
    	let listArticles = [];
    	let modalAdd, modalEdit, modalDelete = false;
    	let deleteModal = true;
    	let updatedArticle = {};

    	let article = {
    		id: undefined,
    		title: '',
    		description: '',
    		category: '',
    		categories: [],
    		status: '',
    		created: undefined,
    		updated: undefined
    	};

    	let categories = [
    		{ id: 1, title: "Categorie 1" },
    		{ id: 2, title: "Categorie 2" },
    		{ id: 31, title: "Categorie 3" },
    		{ id: 4, title: "Categorie 4" }
    	];

    	let keywords = [
    		{
    			id: 1,
    			title: "Developpement web",
    			choose: false
    		},
    		{ id: 2, title: "Design", choose: false }
    	];

    	if (localStorage.getItem("articles")) {
    		listArticles = JSON.parse(localStorage.getItem("articles"));
    	}

    	const createArticle = () => {
    		if (!article.title.trim()) {
    			$$invalidate(5, article.title = '', article);
    			return;
    		}

    		article.description != '' || !article.description.trim()
    		? $$invalidate(5, article.status = 'brouillon', article)
    		: $$invalidate(5, article.status = 'archive', article);

    		$$invalidate(5, article.id = Date.now(), article);
    		$$invalidate(5, article.created = new Date().toLocaleDateString("fr"), article);
    		$$invalidate(5, article.keywords = article.keywords.split(','), article);
    		console.log(article.keywords);
    		$$invalidate(0, listArticles = [...listArticles, article]);

    		$$invalidate(5, article = {
    			id: undefined,
    			title: '',
    			description: '',
    			category: '',
    			status: '',
    			keywords: []
    		});
    	};

    	const updateArticle = () => {
    		const productIndex = listArticles.findIndex(p => p.id === updatedArticle.id);

    		updatedArticle.description == '' || !updatedArticle.description.trim()
    		? $$invalidate(4, updatedArticle.status = 'brouillon', updatedArticle)
    		: $$invalidate(4, updatedArticle.status = 'archive', updatedArticle);

    		$$invalidate(4, updatedArticle.updated = new Date().toLocaleDateString("fr"), updatedArticle);
    		$$invalidate(0, listArticles[productIndex] = updatedArticle, listArticles);
    		isNew = true;
    		$$invalidate(4, updatedArticle = {});
    	};

    	const deleteArticle = id => {
    		$$invalidate(0, listArticles = listArticles.filter(item => item.id !== id));
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<ListArticles> was created with unknown prop '${key}'`);
    	});

    	const click_handler = item => {
    		$$invalidate(2, modalEdit = true);
    		$$invalidate(4, updatedArticle = item);
    	};

    	const click_handler_1 = () => {
    		$$invalidate(1, modalAdd = true);
    	};

    	const click_handler_2 = () => {
    		$$invalidate(1, modalAdd = false);
    	};

    	const click_handler_3 = () => {
    		$$invalidate(1, modalAdd = false);
    	};

    	function input_input_handler() {
    		article.title = this.value;
    		$$invalidate(5, article);
    	}

    	function textarea0_input_handler() {
    		article.description = this.value;
    		$$invalidate(5, article);
    	}

    	function textarea1_input_handler() {
    		article.keywords = this.value;
    		$$invalidate(5, article);
    	}

    	function input_change_handler(each_value, category_index) {
    		each_value[category_index].id = this.checked;
    		$$invalidate(6, categories);
    	}

    	const click_handler_4 = () => {
    		$$invalidate(1, modalAdd = false);
    	};

    	const click_handler_5 = () => {
    		$$invalidate(2, modalEdit = false);
    	};

    	const click_handler_6 = () => {
    		$$invalidate(2, modalEdit = false);
    	};

    	function input0_input_handler() {
    		updatedArticle.title = this.value;
    		$$invalidate(4, updatedArticle);
    	}

    	function textarea0_input_handler_1() {
    		updatedArticle.description = this.value;
    		$$invalidate(4, updatedArticle);
    	}

    	function textarea1_input_handler_1() {
    		updatedArticle.keywords = this.value;
    		$$invalidate(4, updatedArticle);
    	}

    	const click_handler_7 = () => {
    		$$invalidate(2, modalEdit = false);
    	};

    	const click_handler_8 = () => {
    		$$invalidate(3, modalDelete = false);
    	};

    	const click_handler_9 = () => {
    		$$invalidate(3, modalDelete = false);
    	};

    	$$self.$capture_state = () => ({
    		listArticles,
    		modalAdd,
    		modalEdit,
    		modalDelete,
    		deleteModal,
    		updatedArticle,
    		article,
    		categories,
    		keywords,
    		createArticle,
    		updateArticle,
    		deleteArticle
    	});

    	$$self.$inject_state = $$props => {
    		if ('listArticles' in $$props) $$invalidate(0, listArticles = $$props.listArticles);
    		if ('modalAdd' in $$props) $$invalidate(1, modalAdd = $$props.modalAdd);
    		if ('modalEdit' in $$props) $$invalidate(2, modalEdit = $$props.modalEdit);
    		if ('modalDelete' in $$props) $$invalidate(3, modalDelete = $$props.modalDelete);
    		if ('deleteModal' in $$props) $$invalidate(7, deleteModal = $$props.deleteModal);
    		if ('updatedArticle' in $$props) $$invalidate(4, updatedArticle = $$props.updatedArticle);
    		if ('article' in $$props) $$invalidate(5, article = $$props.article);
    		if ('categories' in $$props) $$invalidate(6, categories = $$props.categories);
    		if ('keywords' in $$props) keywords = $$props.keywords;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*listArticles*/ 1) {
    			localStorage.setItem("articles", JSON.stringify(listArticles));
    		}
    	};

    	return [
    		listArticles,
    		modalAdd,
    		modalEdit,
    		modalDelete,
    		updatedArticle,
    		article,
    		categories,
    		deleteModal,
    		createArticle,
    		updateArticle,
    		deleteArticle,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		input_input_handler,
    		textarea0_input_handler,
    		textarea1_input_handler,
    		input_change_handler,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6,
    		input0_input_handler,
    		textarea0_input_handler_1,
    		textarea1_input_handler_1,
    		click_handler_7,
    		click_handler_8,
    		click_handler_9
    	];
    }

    class ListArticles extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {}, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ListArticles",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\views\homePage.svelte generated by Svelte v3.46.4 */
    const file = "src\\views\\homePage.svelte";

    function create_fragment$1(ctx) {
    	let nav;
    	let ul3;
    	let li3;
    	let ul0;
    	let li0;
    	let a0;
    	let t1;
    	let li1;
    	let a1;
    	let t3;
    	let li2;
    	let a2;
    	let t5;
    	let li6;
    	let ul1;
    	let li4;
    	let a3;
    	let t7;
    	let li5;
    	let a4;
    	let t9;
    	let li13;
    	let ul2;
    	let li7;
    	let t11;
    	let li8;
    	let t13;
    	let li9;
    	let t15;
    	let li10;
    	let t17;
    	let li11;
    	let t19;
    	let li12;
    	let t21;
    	let header;
    	let div;
    	let span;
    	let input;
    	let t22;
    	let img;
    	let img_src_value;
    	let t23;
    	let listarticles;
    	let current;
    	listarticles = new ListArticles({ $$inline: true });

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			ul3 = element("ul");
    			li3 = element("li");
    			ul0 = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "Catégorie 1";
    			t1 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "Catégorie 2";
    			t3 = space();
    			li2 = element("li");
    			a2 = element("a");
    			a2.textContent = "Catégorie 3";
    			t5 = space();
    			li6 = element("li");
    			ul1 = element("ul");
    			li4 = element("li");
    			a3 = element("a");
    			a3.textContent = "Notes";
    			t7 = space();
    			li5 = element("li");
    			a4 = element("a");
    			a4.textContent = "Vérouillé";
    			t9 = space();
    			li13 = element("li");
    			ul2 = element("ul");
    			li7 = element("li");
    			li7.textContent = "Mot";
    			t11 = space();
    			li8 = element("li");
    			li8.textContent = "Mot clef 1";
    			t13 = space();
    			li9 = element("li");
    			li9.textContent = "Mot";
    			t15 = space();
    			li10 = element("li");
    			li10.textContent = "Mot clef 1";
    			t17 = space();
    			li11 = element("li");
    			li11.textContent = "Mot clef 1";
    			t19 = space();
    			li12 = element("li");
    			li12.textContent = "Mot clef 1";
    			t21 = space();
    			header = element("header");
    			div = element("div");
    			span = element("span");
    			input = element("input");
    			t22 = space();
    			img = element("img");
    			t23 = space();
    			create_component(listarticles.$$.fragment);
    			attr_dev(a0, "href", "#");
    			attr_dev(a0, "class", "nav-current");
    			add_location(a0, file, 8, 20, 174);
    			add_location(li0, file, 8, 16, 170);
    			attr_dev(a1, "href", "#");
    			add_location(a1, file, 9, 20, 249);
    			add_location(li1, file, 9, 16, 245);
    			attr_dev(a2, "href", "#");
    			add_location(a2, file, 10, 20, 303);
    			add_location(li2, file, 10, 16, 299);
    			attr_dev(ul0, "class", "nav-links");
    			add_location(ul0, file, 7, 12, 130);
    			add_location(li3, file, 6, 8, 112);
    			attr_dev(a3, "href", "#");
    			add_location(a3, file, 15, 20, 441);
    			add_location(li4, file, 15, 16, 437);
    			attr_dev(a4, "href", "#");
    			add_location(a4, file, 16, 20, 489);
    			add_location(li5, file, 16, 16, 485);
    			attr_dev(ul1, "class", "nav-links");
    			add_location(ul1, file, 14, 12, 397);
    			add_location(li6, file, 13, 8, 379);
    			attr_dev(li7, "class", "nav-current");
    			add_location(li7, file, 21, 16, 620);
    			add_location(li8, file, 22, 16, 670);
    			add_location(li9, file, 23, 16, 707);
    			add_location(li10, file, 24, 16, 737);
    			add_location(li11, file, 25, 16, 774);
    			add_location(li12, file, 26, 16, 811);
    			attr_dev(ul2, "class", "keywords");
    			add_location(ul2, file, 20, 12, 581);
    			add_location(li13, file, 19, 8, 563);
    			add_location(ul3, file, 5, 4, 98);
    			add_location(nav, file, 4, 0, 87);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "name", "");
    			input.value = "";
    			attr_dev(input, "placeholder", "Rechercher...");
    			add_location(input, file, 34, 12, 978);
    			if (!src_url_equal(img.src, img_src_value = "./assets/img/search.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "search");
    			add_location(img, file, 35, 12, 1056);
    			attr_dev(span, "class", "search-input");
    			add_location(span, file, 33, 8, 937);
    			attr_dev(div, "class", "header-contain");
    			add_location(div, file, 32, 4, 899);
    			add_location(header, file, 31, 0, 885);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, ul3);
    			append_dev(ul3, li3);
    			append_dev(li3, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, a0);
    			append_dev(ul0, t1);
    			append_dev(ul0, li1);
    			append_dev(li1, a1);
    			append_dev(ul0, t3);
    			append_dev(ul0, li2);
    			append_dev(li2, a2);
    			append_dev(ul3, t5);
    			append_dev(ul3, li6);
    			append_dev(li6, ul1);
    			append_dev(ul1, li4);
    			append_dev(li4, a3);
    			append_dev(ul1, t7);
    			append_dev(ul1, li5);
    			append_dev(li5, a4);
    			append_dev(ul3, t9);
    			append_dev(ul3, li13);
    			append_dev(li13, ul2);
    			append_dev(ul2, li7);
    			append_dev(ul2, t11);
    			append_dev(ul2, li8);
    			append_dev(ul2, t13);
    			append_dev(ul2, li9);
    			append_dev(ul2, t15);
    			append_dev(ul2, li10);
    			append_dev(ul2, t17);
    			append_dev(ul2, li11);
    			append_dev(ul2, t19);
    			append_dev(ul2, li12);
    			insert_dev(target, t21, anchor);
    			insert_dev(target, header, anchor);
    			append_dev(header, div);
    			append_dev(div, span);
    			append_dev(span, input);
    			append_dev(span, t22);
    			append_dev(span, img);
    			insert_dev(target, t23, anchor);
    			mount_component(listarticles, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(listarticles.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(listarticles.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if (detaching) detach_dev(t21);
    			if (detaching) detach_dev(header);
    			if (detaching) detach_dev(t23);
    			destroy_component(listarticles, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('HomePage', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<HomePage> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ ListArticles });
    	return [];
    }

    class HomePage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HomePage",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\main.svelte generated by Svelte v3.46.4 */

    function create_fragment(ctx) {
    	let homepage;
    	let current;
    	homepage = new HomePage({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(homepage.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(homepage, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(homepage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(homepage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(homepage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Main', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Main> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ HomePage });
    	return [];
    }

    class Main extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Main",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var app = new Main({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
