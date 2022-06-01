
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
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
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

    const file = "src\\components\\listArticles.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[32] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[35] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[38] = list[i];
    	return child_ctx;
    }

    // (161:12) {#if item.keywords}
    function create_if_block_3(ctx) {
    	let ul;
    	let each_value_2 = /*item*/ ctx[35].keywords;
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
    			add_location(ul, file, 161, 16, 4204);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*searchArticles*/ 64) {
    				each_value_2 = /*item*/ ctx[35].keywords;
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
    		source: "(161:12) {#if item.keywords}",
    		ctx
    	});

    	return block;
    }

    // (163:20) {#each item.keywords as keyword}
    function create_each_block_2(ctx) {
    	let li;
    	let t_value = /*keyword*/ ctx[38] + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			add_location(li, file, 163, 24, 4305);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*searchArticles*/ 64 && t_value !== (t_value = /*keyword*/ ctx[38] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(163:20) {#each item.keywords as keyword}",
    		ctx
    	});

    	return block;
    }

    // (154:0) {#each searchArticles as item}
    function create_each_block_1(ctx) {
    	let li;
    	let h2;
    	let t0_value = /*item*/ ctx[35].title + "";
    	let t0;
    	let t1;
    	let p0;
    	let t2_value = /*item*/ ctx[35].description + "";
    	let t2;
    	let t3;
    	let p1;

    	let t4_value = (/*item*/ ctx[35].category
    	? /*item*/ ctx[35].category.title
    	: "") + "";

    	let t4;
    	let t5;
    	let div1;
    	let t6;
    	let div0;
    	let button0;
    	let svg0;
    	let path0;
    	let t7;
    	let button1;
    	let svg1;
    	let path1;
    	let t8;
    	let button2;
    	let svg2;
    	let path2;
    	let t9;
    	let li_id_value;
    	let mounted;
    	let dispose;
    	let if_block = /*item*/ ctx[35].keywords && create_if_block_3(ctx);

    	function click_handler() {
    		return /*click_handler*/ ctx[14](/*item*/ ctx[35]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();
    			p0 = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			p1 = element("p");
    			t4 = text(t4_value);
    			t5 = space();
    			div1 = element("div");
    			if (if_block) if_block.c();
    			t6 = space();
    			div0 = element("div");
    			button0 = element("button");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t7 = space();
    			button1 = element("button");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t8 = space();
    			button2 = element("button");
    			svg2 = svg_element("svg");
    			path2 = svg_element("path");
    			t9 = space();
    			add_location(h2, file, 156, 8, 4005);
    			add_location(p0, file, 157, 8, 4036);
    			add_location(p1, file, 158, 8, 4071);
    			attr_dev(path0, "d", "M 15 2 C 11.145666 2 8 5.1456661 8 9 L 8 11 L 6 11 C 4.895 11 4 11.895 4 13 L 4 25 C 4 26.105 4.895 27 6 27 L 24 27 C 25.105 27 26 26.105 26 25 L 26 13 C 26 11.895 25.105 11 24 11 L 22 11 L 22 9 C 22 5.2715823 19.036581 2.2685653 15.355469 2.0722656 A 1.0001 1.0001 0 0 0 15 2 z M 15 4 C 17.773666 4 20 6.2263339 20 9 L 20 11 L 10 11 L 10 9 C 10 6.2263339 12.226334 4 15 4 z");
    			add_location(path0, file, 169, 82, 4591);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 30 30");
    			add_location(svg0, file, 169, 20, 4529);
    			attr_dev(button0, "class", "button lock");
    			add_location(button0, file, 168, 16, 4447);
    			attr_dev(path1, "d", "M 18.414062 2 C 18.158188 2 17.902031 2.0974687 17.707031 2.2929688 L 16 4 L 20 8 L 21.707031 6.2929688 C 22.098031 5.9019687 22.098031 5.2689063 21.707031 4.8789062 L 19.121094 2.2929688 C 18.925594 2.0974687 18.669937 2 18.414062 2 z M 14.5 5.5 L 3 17 L 3 21 L 7 21 L 18.5 9.5 L 14.5 5.5 z");
    			add_location(path1, file, 172, 82, 5225);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 24 24");
    			add_location(svg1, file, 172, 20, 5163);
    			attr_dev(button1, "class", "button edit");
    			add_location(button1, file, 171, 16, 5056);
    			attr_dev(path2, "d", "M 10.806641 2 C 10.289641 2 9.7956875 2.2043125 9.4296875 2.5703125 L 9 3 L 4 3 A 1.0001 1.0001 0 1 0 4 5 L 20 5 A 1.0001 1.0001 0 1 0 20 3 L 15 3 L 14.570312 2.5703125 C 14.205312 2.2043125 13.710359 2 13.193359 2 L 10.806641 2 z M 4.3652344 7 L 5.8925781 20.263672 C 6.0245781 21.253672 6.877 22 7.875 22 L 16.123047 22 C 17.121047 22 17.974422 21.254859 18.107422 20.255859 L 19.634766 7 L 4.3652344 7 z");
    			add_location(path2, file, 175, 80, 5725);
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "viewBox", "0 0 24 24");
    			add_location(svg2, file, 175, 20, 5665);
    			attr_dev(button2, "class", "button delete");
    			add_location(button2, file, 174, 16, 5579);
    			attr_dev(div0, "class", "buttons");
    			add_location(div0, file, 167, 12, 4408);
    			attr_dev(div1, "class", "note-foot");
    			add_location(div1, file, 159, 8, 4130);
    			attr_dev(li, "class", "note");
    			attr_dev(li, "id", li_id_value = /*item*/ ctx[35].id);
    			add_location(li, file, 155, 4, 3963);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, h2);
    			append_dev(h2, t0);
    			append_dev(li, t1);
    			append_dev(li, p0);
    			append_dev(p0, t2);
    			append_dev(li, t3);
    			append_dev(li, p1);
    			append_dev(p1, t4);
    			append_dev(li, t5);
    			append_dev(li, div1);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t6);
    			append_dev(div1, div0);
    			append_dev(div0, button0);
    			append_dev(button0, svg0);
    			append_dev(svg0, path0);
    			append_dev(div0, t7);
    			append_dev(div0, button1);
    			append_dev(button1, svg1);
    			append_dev(svg1, path1);
    			append_dev(div0, t8);
    			append_dev(div0, button2);
    			append_dev(button2, svg2);
    			append_dev(svg2, path2);
    			append_dev(li, t9);

    			if (!mounted) {
    				dispose = [
    					listen_dev(
    						button0,
    						"click",
    						function () {
    							if (is_function(/*deleteModal*/ ctx[7](/*item*/ ctx[35].id))) /*deleteModal*/ ctx[7](/*item*/ ctx[35].id).apply(this, arguments);
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
    							if (is_function(/*deleteArticle*/ ctx[11](/*item*/ ctx[35].id))) /*deleteArticle*/ ctx[11](/*item*/ ctx[35].id).apply(this, arguments);
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
    			if (dirty[0] & /*searchArticles*/ 64 && t0_value !== (t0_value = /*item*/ ctx[35].title + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*searchArticles*/ 64 && t2_value !== (t2_value = /*item*/ ctx[35].description + "")) set_data_dev(t2, t2_value);

    			if (dirty[0] & /*searchArticles*/ 64 && t4_value !== (t4_value = (/*item*/ ctx[35].category
    			? /*item*/ ctx[35].category.title
    			: "") + "")) set_data_dev(t4, t4_value);

    			if (/*item*/ ctx[35].keywords) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_3(ctx);
    					if_block.c();
    					if_block.m(div1, t6);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty[0] & /*searchArticles*/ 64 && li_id_value !== (li_id_value = /*item*/ ctx[35].id)) {
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
    		source: "(154:0) {#each searchArticles as item}",
    		ctx
    	});

    	return block;
    }

    // (187:0) {#if modalAdd }
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
    	let select;
    	let t15;
    	let div2;
    	let button0;
    	let t17;
    	let button1;
    	let mounted;
    	let dispose;
    	let each_value = /*categories*/ ctx[8];
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
    			h33.textContent = "Ajouter une catégorie:";
    			t14 = space();
    			span3 = element("span");
    			select = element("select");

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
    			add_location(div0, file, 189, 8, 6491);
    			attr_dev(div1, "class", "icon-close close-modal");
    			add_location(div1, file, 192, 16, 6659);
    			attr_dev(h2, "class", "modal-h2");
    			add_location(h2, file, 193, 16, 6756);
    			attr_dev(h30, "class", "modal-h3");
    			add_location(h30, file, 194, 16, 6816);
    			attr_dev(input, "type", "text");
    			input.required = true;
    			add_location(input, file, 196, 20, 6910);
    			attr_dev(span0, "class", "text");
    			add_location(span0, file, 195, 16, 6869);
    			attr_dev(h31, "class", "modal-h3");
    			add_location(h31, file, 198, 16, 7008);
    			attr_dev(textarea0, "name", "note");
    			textarea0.required = true;
    			add_location(textarea0, file, 200, 20, 7102);
    			attr_dev(span1, "class", "text");
    			add_location(span1, file, 199, 16, 7061);
    			attr_dev(h32, "class", "modal-h3");
    			add_location(h32, file, 202, 16, 7220);
    			attr_dev(textarea1, "name", "keywords");
    			attr_dev(textarea1, "placeholder", "Ecrire les mots clefs séparés par une vigurle");
    			add_location(textarea1, file, 204, 20, 7339);
    			attr_dev(span2, "class", "text text-small");
    			add_location(span2, file, 203, 16, 7287);
    			attr_dev(h33, "class", "modal-h3");
    			add_location(h33, file, 206, 16, 7509);
    			if (/*article*/ ctx[5].category === void 0) add_render_callback(() => /*select_change_handler*/ ctx[21].call(select));
    			add_location(select, file, 208, 20, 7622);
    			attr_dev(span3, "class", "categories");
    			add_location(span3, file, 207, 16, 7575);
    			attr_dev(button0, "class", "button button-large");
    			add_location(button0, file, 217, 20, 8013);
    			attr_dev(button1, "type", "submit");
    			attr_dev(button1, "class", "button button-large");
    			add_location(button1, file, 218, 20, 8124);
    			attr_dev(div2, "class", "modal-foot");
    			add_location(div2, file, 216, 16, 7967);
    			attr_dev(div3, "class", "modal-wrap");
    			add_location(div3, file, 191, 12, 6617);
    			attr_dev(div4, "class", "modal-inner");
    			add_location(div4, file, 190, 8, 6578);
    			attr_dev(form, "class", "modal modal-add");
    			add_location(form, file, 188, 4, 6409);
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
    			append_dev(span3, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*article*/ ctx[5].category);
    			append_dev(div3, t15);
    			append_dev(div3, div2);
    			append_dev(div2, button0);
    			append_dev(div2, t17);
    			append_dev(div2, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler_2*/ ctx[16], false, false, false),
    					listen_dev(div1, "click", /*click_handler_3*/ ctx[17], false, false, false),
    					listen_dev(input, "input", /*input_input_handler_1*/ ctx[18]),
    					listen_dev(textarea0, "input", /*textarea0_input_handler*/ ctx[19]),
    					listen_dev(textarea1, "input", /*textarea1_input_handler*/ ctx[20]),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[21]),
    					listen_dev(button0, "click", /*click_handler_4*/ ctx[22], false, false, false),
    					listen_dev(form, "submit", prevent_default(/*createArticle*/ ctx[9]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*article, categories*/ 288 && input.value !== /*article*/ ctx[5].title) {
    				set_input_value(input, /*article*/ ctx[5].title);
    			}

    			if (dirty[0] & /*article, categories*/ 288) {
    				set_input_value(textarea0, /*article*/ ctx[5].description);
    			}

    			if (dirty[0] & /*article, categories*/ 288) {
    				set_input_value(textarea1, /*article*/ ctx[5].keywords);
    			}

    			if (dirty[0] & /*categories*/ 256) {
    				each_value = /*categories*/ ctx[8];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty[0] & /*article, categories*/ 288) {
    				select_option(select, /*article*/ ctx[5].category);
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
    		source: "(187:0) {#if modalAdd }",
    		ctx
    	});

    	return block;
    }

    // (210:24) {#each categories as category}
    function create_each_block(ctx) {
    	let option;
    	let t0_value = /*category*/ ctx[32].title + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = /*category*/ ctx[32];
    			option.value = option.__value;
    			add_location(option, file, 210, 28, 7746);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(210:24) {#each categories as category}",
    		ctx
    	});

    	return block;
    }

    // (227:0) {#if modalEdit}
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
    			add_location(div0, file, 229, 4, 8382);
    			attr_dev(div1, "class", "icon-close");
    			add_location(div1, file, 232, 12, 8526);
    			attr_dev(h2, "class", "modal-h2");
    			add_location(h2, file, 233, 12, 8608);
    			attr_dev(h30, "class", "modal-h3");
    			add_location(h30, file, 234, 12, 8665);
    			attr_dev(input0, "type", "text");
    			input0.required = true;
    			add_location(input0, file, 236, 20, 8759);
    			attr_dev(span0, "class", "text");
    			add_location(span0, file, 235, 16, 8718);
    			attr_dev(h31, "class", "modal-h3");
    			add_location(h31, file, 238, 12, 8860);
    			attr_dev(textarea0, "name", "note");
    			attr_dev(textarea0, "placeholder", "Ecrire votre note...");
    			textarea0.required = true;
    			add_location(textarea0, file, 240, 16, 8946);
    			attr_dev(span1, "class", "text");
    			add_location(span1, file, 239, 12, 8909);
    			attr_dev(h32, "class", "modal-h3");
    			add_location(h32, file, 242, 12, 9098);
    			attr_dev(textarea1, "name", "keywords");
    			attr_dev(textarea1, "placeholder", "Ecrire les mots clefs séparés par une vigurle");
    			add_location(textarea1, file, 244, 16, 9209);
    			attr_dev(span2, "class", "text text-small");
    			add_location(span2, file, 243, 12, 9161);
    			attr_dev(h33, "class", "modal-h3");
    			add_location(h33, file, 246, 12, 9379);
    			attr_dev(input1, "type", "checkbox");
    			attr_dev(input1, "name", "category");
    			input1.value = "categorie-1";
    			add_location(input1, file, 249, 20, 9514);
    			add_location(span3, file, 250, 20, 9595);
    			add_location(label, file, 248, 16, 9485);
    			attr_dev(span4, "class", "categories");
    			add_location(span4, file, 247, 12, 9442);
    			attr_dev(button0, "class", "button button-large");
    			add_location(button0, file, 254, 16, 9722);
    			attr_dev(button1, "type", "submit");
    			attr_dev(button1, "class", "button button-large");
    			add_location(button1, file, 255, 16, 9830);
    			attr_dev(div2, "class", "modal-foot");
    			add_location(div2, file, 253, 12, 9680);
    			attr_dev(div3, "class", "modal-wrap");
    			add_location(div3, file, 231, 7, 8488);
    			attr_dev(div4, "class", "modal-inner");
    			add_location(div4, file, 230, 4, 8454);
    			attr_dev(form, "class", "modal modal-edit");
    			add_location(form, file, 228, 0, 8303);
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
    					listen_dev(div0, "click", /*click_handler_5*/ ctx[23], false, false, false),
    					listen_dev(div1, "click", /*click_handler_6*/ ctx[24], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[25]),
    					listen_dev(textarea0, "input", /*textarea0_input_handler_1*/ ctx[26]),
    					listen_dev(textarea1, "input", /*textarea1_input_handler_1*/ ctx[27]),
    					listen_dev(button0, "click", /*click_handler_7*/ ctx[28], false, false, false),
    					listen_dev(form, "submit", prevent_default(/*updateArticle*/ ctx[10]), false, true, false)
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
    		source: "(227:0) {#if modalEdit}",
    		ctx
    	});

    	return block;
    }

    // (264:0) {#if modalDelete}
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
    			add_location(div0, file, 266, 8, 10032);
    			attr_dev(div1, "class", "icon-close close-modal");
    			add_location(div1, file, 269, 16, 10192);
    			attr_dev(span, "class", "text");
    			add_location(span, file, 270, 16, 10252);
    			attr_dev(button0, "class", "button button-large");
    			add_location(button0, file, 274, 20, 10426);
    			attr_dev(button1, "class", "button button-large");
    			add_location(button1, file, 275, 20, 10540);
    			attr_dev(div2, "class", "modal-foot");
    			add_location(div2, file, 273, 16, 10380);
    			attr_dev(div3, "class", "modal-wrap");
    			add_location(div3, file, 268, 12, 10150);
    			attr_dev(div4, "class", "modal-inner");
    			add_location(div4, file, 267, 8, 10111);
    			attr_dev(div5, "class", "modal modal-delete");
    			add_location(div5, file, 265, 4, 9990);
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
    					listen_dev(div0, "click", /*click_handler_8*/ ctx[29], false, false, false),
    					listen_dev(button0, "click", /*click_handler_9*/ ctx[30], false, false, false)
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
    		source: "(264:0) {#if modalDelete}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let link;
    	let t0;
    	let nav;
    	let ul3;
    	let li3;
    	let ul0;
    	let li0;
    	let a0;
    	let t2;
    	let li1;
    	let a1;
    	let t4;
    	let li2;
    	let a2;
    	let t6;
    	let li6;
    	let ul1;
    	let li4;
    	let a3;
    	let t8;
    	let li5;
    	let a4;
    	let t10;
    	let li13;
    	let ul2;
    	let li7;
    	let t12;
    	let li8;
    	let t14;
    	let li9;
    	let t16;
    	let li10;
    	let t18;
    	let li11;
    	let t20;
    	let li12;
    	let t22;
    	let header;
    	let div0;
    	let span;
    	let input;
    	let t23;
    	let img0;
    	let img0_src_value;
    	let t24;
    	let main;
    	let ul4;
    	let t25;
    	let div1;
    	let img1;
    	let img1_src_value;
    	let t26;
    	let t27;
    	let t28;
    	let if_block2_anchor;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*searchArticles*/ ctx[6];
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
    			nav = element("nav");
    			ul3 = element("ul");
    			li3 = element("li");
    			ul0 = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "Catégorie 1";
    			t2 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "Catégorie 2";
    			t4 = space();
    			li2 = element("li");
    			a2 = element("a");
    			a2.textContent = "Catégorie 3";
    			t6 = space();
    			li6 = element("li");
    			ul1 = element("ul");
    			li4 = element("li");
    			a3 = element("a");
    			a3.textContent = "Notes";
    			t8 = space();
    			li5 = element("li");
    			a4 = element("a");
    			a4.textContent = "Vérouillé";
    			t10 = space();
    			li13 = element("li");
    			ul2 = element("ul");
    			li7 = element("li");
    			li7.textContent = "Mot";
    			t12 = space();
    			li8 = element("li");
    			li8.textContent = "Mot clef 1";
    			t14 = space();
    			li9 = element("li");
    			li9.textContent = "Mot";
    			t16 = space();
    			li10 = element("li");
    			li10.textContent = "Mot clef 1";
    			t18 = space();
    			li11 = element("li");
    			li11.textContent = "Mot clef 1";
    			t20 = space();
    			li12 = element("li");
    			li12.textContent = "Mot clef 1";
    			t22 = space();
    			header = element("header");
    			div0 = element("div");
    			span = element("span");
    			input = element("input");
    			t23 = space();
    			img0 = element("img");
    			t24 = space();
    			main = element("main");
    			ul4 = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t25 = space();
    			div1 = element("div");
    			img1 = element("img");
    			t26 = space();
    			if (if_block0) if_block0.c();
    			t27 = space();
    			if (if_block1) if_block1.c();
    			t28 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "https://fonts.googleapis.com/icon?family=Material+Icons");
    			add_location(link, file, 0, 0, 0);
    			attr_dev(a0, "href", "#");
    			attr_dev(a0, "class", "nav-current");
    			add_location(a0, file, 117, 20, 2868);
    			add_location(li0, file, 117, 16, 2864);
    			attr_dev(a1, "href", "#");
    			add_location(a1, file, 118, 20, 2943);
    			add_location(li1, file, 118, 16, 2939);
    			attr_dev(a2, "href", "#");
    			add_location(a2, file, 119, 20, 2997);
    			add_location(li2, file, 119, 16, 2993);
    			attr_dev(ul0, "class", "nav-links");
    			add_location(ul0, file, 116, 12, 2824);
    			add_location(li3, file, 115, 8, 2806);
    			attr_dev(a3, "href", "#");
    			add_location(a3, file, 124, 20, 3135);
    			add_location(li4, file, 124, 16, 3131);
    			attr_dev(a4, "href", "#");
    			add_location(a4, file, 125, 20, 3183);
    			add_location(li5, file, 125, 16, 3179);
    			attr_dev(ul1, "class", "nav-links");
    			add_location(ul1, file, 123, 12, 3091);
    			add_location(li6, file, 122, 8, 3073);
    			attr_dev(li7, "class", "nav-current");
    			add_location(li7, file, 130, 16, 3314);
    			add_location(li8, file, 131, 16, 3364);
    			add_location(li9, file, 132, 16, 3401);
    			add_location(li10, file, 133, 16, 3431);
    			add_location(li11, file, 134, 16, 3468);
    			add_location(li12, file, 135, 16, 3505);
    			attr_dev(ul2, "class", "keywords");
    			add_location(ul2, file, 129, 12, 3275);
    			add_location(li13, file, 128, 8, 3257);
    			add_location(ul3, file, 114, 4, 2792);
    			add_location(nav, file, 113, 0, 2781);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "name", "");
    			attr_dev(input, "placeholder", "Rechercher...");
    			add_location(input, file, 143, 12, 3672);
    			if (!src_url_equal(img0.src, img0_src_value = "./img/search.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "search");
    			add_location(img0, file, 144, 12, 3767);
    			attr_dev(span, "class", "search-input");
    			add_location(span, file, 142, 8, 3631);
    			attr_dev(div0, "class", "header-contain");
    			add_location(div0, file, 141, 4, 3593);
    			add_location(header, file, 140, 0, 3579);
    			attr_dev(ul4, "class", "notes");
    			add_location(ul4, file, 150, 4, 3867);
    			if (!src_url_equal(img1.src, img1_src_value = "./img/add.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "plus");
    			add_location(img1, file, 182, 58, 6327);
    			attr_dev(div1, "class", "more");
    			add_location(div1, file, 182, 4, 6273);
    			add_location(main, file, 149, 0, 3855);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, nav, anchor);
    			append_dev(nav, ul3);
    			append_dev(ul3, li3);
    			append_dev(li3, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, a0);
    			append_dev(ul0, t2);
    			append_dev(ul0, li1);
    			append_dev(li1, a1);
    			append_dev(ul0, t4);
    			append_dev(ul0, li2);
    			append_dev(li2, a2);
    			append_dev(ul3, t6);
    			append_dev(ul3, li6);
    			append_dev(li6, ul1);
    			append_dev(ul1, li4);
    			append_dev(li4, a3);
    			append_dev(ul1, t8);
    			append_dev(ul1, li5);
    			append_dev(li5, a4);
    			append_dev(ul3, t10);
    			append_dev(ul3, li13);
    			append_dev(li13, ul2);
    			append_dev(ul2, li7);
    			append_dev(ul2, t12);
    			append_dev(ul2, li8);
    			append_dev(ul2, t14);
    			append_dev(ul2, li9);
    			append_dev(ul2, t16);
    			append_dev(ul2, li10);
    			append_dev(ul2, t18);
    			append_dev(ul2, li11);
    			append_dev(ul2, t20);
    			append_dev(ul2, li12);
    			insert_dev(target, t22, anchor);
    			insert_dev(target, header, anchor);
    			append_dev(header, div0);
    			append_dev(div0, span);
    			append_dev(span, input);
    			set_input_value(input, /*searchTerm*/ ctx[0]);
    			append_dev(span, t23);
    			append_dev(span, img0);
    			insert_dev(target, t24, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, ul4);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul4, null);
    			}

    			append_dev(main, t25);
    			append_dev(main, div1);
    			append_dev(div1, img1);
    			insert_dev(target, t26, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t27, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t28, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, if_block2_anchor, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[13]),
    					listen_dev(div1, "click", /*click_handler_1*/ ctx[15], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*searchTerm*/ 1 && input.value !== /*searchTerm*/ ctx[0]) {
    				set_input_value(input, /*searchTerm*/ ctx[0]);
    			}

    			if (dirty[0] & /*searchArticles, deleteArticle, modalEdit, updatedArticle, deleteModal*/ 2260) {
    				each_value_1 = /*searchArticles*/ ctx[6];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul4, null);
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
    					if_block0.m(t27.parentNode, t27);
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
    					if_block1.m(t28.parentNode, t28);
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
    			if (detaching) detach_dev(nav);
    			if (detaching) detach_dev(t22);
    			if (detaching) detach_dev(header);
    			if (detaching) detach_dev(t24);
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t26);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t27);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t28);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(if_block2_anchor);
    			mounted = false;
    			run_all(dispose);
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
    	let searchArticles;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ListArticles', slots, []);
    	let listArticles = [];
    	let modalAdd, modalEdit, modalDelete = false;
    	let deleteModal = true;
    	let searchTerm = "";
    	let updatedArticle = {};

    	let article = {
    		id: undefined,
    		title: '',
    		description: '',
    		category: '',
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
    		$$invalidate(12, listArticles = [...listArticles, article]);

    		$$invalidate(5, article = {
    			id: undefined,
    			title: '',
    			description: '',
    			category: '',
    			status: '',
    			keywords: []
    		});

    		$$invalidate(1, modalAdd = false);
    	};

    	const updateArticle = () => {
    		const productIndex = listArticles.findIndex(p => p.id === updatedArticle.id);

    		updatedArticle.description == '' || !updatedArticle.description.trim()
    		? $$invalidate(4, updatedArticle.status = 'brouillon', updatedArticle)
    		: $$invalidate(4, updatedArticle.status = 'archive', updatedArticle);

    		$$invalidate(4, updatedArticle.updated = new Date().toLocaleDateString("fr"), updatedArticle);
    		$$invalidate(12, listArticles[productIndex] = updatedArticle, listArticles);
    		isNew = true;
    		$$invalidate(4, updatedArticle = {});
    		$$invalidate(2, modalEdit = false);
    	};

    	const deleteArticle = id => {
    		$$invalidate(12, listArticles = listArticles.filter(item => item.id !== id));
    		$$invalidate(3, modalDelete = false);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ListArticles> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		searchTerm = this.value;
    		$$invalidate(0, searchTerm);
    	}

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

    	function input_input_handler_1() {
    		article.title = this.value;
    		$$invalidate(5, article);
    		$$invalidate(8, categories);
    	}

    	function textarea0_input_handler() {
    		article.description = this.value;
    		$$invalidate(5, article);
    		$$invalidate(8, categories);
    	}

    	function textarea1_input_handler() {
    		article.keywords = this.value;
    		$$invalidate(5, article);
    		$$invalidate(8, categories);
    	}

    	function select_change_handler() {
    		article.category = select_value(this);
    		$$invalidate(5, article);
    		$$invalidate(8, categories);
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
    		searchTerm,
    		updatedArticle,
    		article,
    		categories,
    		keywords,
    		createArticle,
    		updateArticle,
    		deleteArticle,
    		searchArticles
    	});

    	$$self.$inject_state = $$props => {
    		if ('listArticles' in $$props) $$invalidate(12, listArticles = $$props.listArticles);
    		if ('modalAdd' in $$props) $$invalidate(1, modalAdd = $$props.modalAdd);
    		if ('modalEdit' in $$props) $$invalidate(2, modalEdit = $$props.modalEdit);
    		if ('modalDelete' in $$props) $$invalidate(3, modalDelete = $$props.modalDelete);
    		if ('deleteModal' in $$props) $$invalidate(7, deleteModal = $$props.deleteModal);
    		if ('searchTerm' in $$props) $$invalidate(0, searchTerm = $$props.searchTerm);
    		if ('updatedArticle' in $$props) $$invalidate(4, updatedArticle = $$props.updatedArticle);
    		if ('article' in $$props) $$invalidate(5, article = $$props.article);
    		if ('categories' in $$props) $$invalidate(8, categories = $$props.categories);
    		if ('keywords' in $$props) keywords = $$props.keywords;
    		if ('searchArticles' in $$props) $$invalidate(6, searchArticles = $$props.searchArticles);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*listArticles*/ 4096) {
    			localStorage.setItem("articles", JSON.stringify(listArticles));
    		}

    		if ($$self.$$.dirty[0] & /*listArticles, searchTerm*/ 4097) {
    			$$invalidate(6, searchArticles = listArticles.filter(art => {
    				return art.title.includes(searchTerm) || art.description.includes(searchTerm);
    			}));
    		}
    	};

    	return [
    		searchTerm,
    		modalAdd,
    		modalEdit,
    		modalDelete,
    		updatedArticle,
    		article,
    		searchArticles,
    		deleteModal,
    		categories,
    		createArticle,
    		updateArticle,
    		deleteArticle,
    		listArticles,
    		input_input_handler,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		input_input_handler_1,
    		textarea0_input_handler,
    		textarea1_input_handler,
    		select_change_handler,
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

    function create_fragment$1(ctx) {
    	let listarticles;
    	let current;
    	listarticles = new ListArticles({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(listarticles.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
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
