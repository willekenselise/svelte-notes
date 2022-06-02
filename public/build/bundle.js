
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
    const file = "src\\components\\listArticles.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[39] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[42] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[45] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[45] = list[i];
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[39] = list[i];
    	return child_ctx;
    }

    // (169:16) {#if listCategories}
    function create_if_block_6(ctx) {
    	let each_1_anchor;
    	let each_value_4 = /*listCategories*/ ctx[3];
    	validate_each_argument(each_value_4);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*categoryFilter, listCategories*/ 10) {
    				each_value_4 = /*listCategories*/ ctx[3];
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4(ctx, each_value_4, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_4.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(169:16) {#if listCategories}",
    		ctx
    	});

    	return block;
    }

    // (171:20) {#each listCategories as category}
    function create_each_block_4(ctx) {
    	let li;
    	let span;
    	let t_value = /*category*/ ctx[39].title + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[17](/*category*/ ctx[39]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "text");
    			add_location(span, file, 172, 28, 4687);
    			add_location(li, file, 172, 24, 4683);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, span);
    			append_dev(span, t);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*listCategories*/ 8 && t_value !== (t_value = /*category*/ ctx[39].title + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(171:20) {#each listCategories as category}",
    		ctx
    	});

    	return block;
    }

    // (188:16) {#if listKeywords}
    function create_if_block_5(ctx) {
    	let each_1_anchor;
    	let each_value_3 = /*listKeywords*/ ctx[4];
    	validate_each_argument(each_value_3);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*keywordFilter, listKeywords*/ 20) {
    				each_value_3 = /*listKeywords*/ ctx[4];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_3.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(188:16) {#if listKeywords}",
    		ctx
    	});

    	return block;
    }

    // (190:20) {#each listKeywords as keyword}
    function create_each_block_3(ctx) {
    	let li;
    	let t_value = /*keyword*/ ctx[45] + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[18](/*keyword*/ ctx[45]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			add_location(li, file, 191, 24, 5217);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);

    			if (!mounted) {
    				dispose = listen_dev(li, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*listKeywords*/ 16 && t_value !== (t_value = /*keyword*/ ctx[45] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(190:20) {#each listKeywords as keyword}",
    		ctx
    	});

    	return block;
    }

    // (213:0) {#if searchArticles }
    function create_if_block_3(ctx) {
    	let each_1_anchor;
    	let each_value_1 = /*searchArticles*/ ctx[8];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*searchArticles, deleteArticle, modalEdit, updatedArticle, deleteModal*/ 35648) {
    				each_value_1 = /*searchArticles*/ ctx[8];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(213:0) {#if searchArticles }",
    		ctx
    	});

    	return block;
    }

    // (222:16) {#if item.keywords}
    function create_if_block_4(ctx) {
    	let ul;
    	let each_value_2 = /*item*/ ctx[42].keywords;
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
    			add_location(ul, file, 222, 20, 6082);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*searchArticles*/ 256) {
    				each_value_2 = /*item*/ ctx[42].keywords;
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
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(222:16) {#if item.keywords}",
    		ctx
    	});

    	return block;
    }

    // (224:24) {#each item.keywords as keyword}
    function create_each_block_2(ctx) {
    	let li;
    	let t_value = /*keyword*/ ctx[45] + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			add_location(li, file, 224, 28, 6191);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*searchArticles*/ 256 && t_value !== (t_value = /*keyword*/ ctx[45] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(224:24) {#each item.keywords as keyword}",
    		ctx
    	});

    	return block;
    }

    // (215:4) {#each searchArticles as item}
    function create_each_block_1(ctx) {
    	let li;
    	let h2;
    	let t0_value = /*item*/ ctx[42].title + "";
    	let t0;
    	let t1;
    	let p0;
    	let t2_value = /*item*/ ctx[42].description + "";
    	let t2;
    	let t3;
    	let p1;

    	let t4_value = (/*item*/ ctx[42].category
    	? /*item*/ ctx[42].category.title
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
    	let if_block = /*item*/ ctx[42].keywords && create_if_block_4(ctx);

    	function click_handler_2() {
    		return /*click_handler_2*/ ctx[20](/*item*/ ctx[42]);
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
    			add_location(h2, file, 217, 12, 5863);
    			add_location(p0, file, 218, 12, 5898);
    			add_location(p1, file, 219, 12, 5937);
    			attr_dev(path0, "d", "M 15 2 C 11.145666 2 8 5.1456661 8 9 L 8 11 L 6 11 C 4.895 11 4 11.895 4 13 L 4 25 C 4 26.105 4.895 27 6 27 L 24 27 C 25.105 27 26 26.105 26 25 L 26 13 C 26 11.895 25.105 11 24 11 L 22 11 L 22 9 C 22 5.2715823 19.036581 2.2685653 15.355469 2.0722656 A 1.0001 1.0001 0 0 0 15 2 z M 15 4 C 17.773666 4 20 6.2263339 20 9 L 20 11 L 10 11 L 10 9 C 10 6.2263339 12.226334 4 15 4 z");
    			add_location(path0, file, 230, 86, 6501);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 30 30");
    			add_location(svg0, file, 230, 24, 6439);
    			attr_dev(button0, "class", "button lock");
    			add_location(button0, file, 229, 20, 6353);
    			attr_dev(path1, "d", "M 18.414062 2 C 18.158188 2 17.902031 2.0974687 17.707031 2.2929688 L 16 4 L 20 8 L 21.707031 6.2929688 C 22.098031 5.9019687 22.098031 5.2689063 21.707031 4.8789062 L 19.121094 2.2929688 C 18.925594 2.0974687 18.669937 2 18.414062 2 z M 14.5 5.5 L 3 17 L 3 21 L 7 21 L 18.5 9.5 L 14.5 5.5 z");
    			add_location(path1, file, 233, 86, 7147);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 24 24");
    			add_location(svg1, file, 233, 24, 7085);
    			attr_dev(button1, "class", "button edit");
    			add_location(button1, file, 232, 20, 6974);
    			attr_dev(path2, "d", "M 10.806641 2 C 10.289641 2 9.7956875 2.2043125 9.4296875 2.5703125 L 9 3 L 4 3 A 1.0001 1.0001 0 1 0 4 5 L 20 5 A 1.0001 1.0001 0 1 0 20 3 L 15 3 L 14.570312 2.5703125 C 14.205312 2.2043125 13.710359 2 13.193359 2 L 10.806641 2 z M 4.3652344 7 L 5.8925781 20.263672 C 6.0245781 21.253672 6.877 22 7.875 22 L 16.123047 22 C 17.121047 22 17.974422 21.254859 18.107422 20.255859 L 19.634766 7 L 4.3652344 7 z");
    			add_location(path2, file, 236, 84, 7659);
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "viewBox", "0 0 24 24");
    			add_location(svg2, file, 236, 24, 7599);
    			attr_dev(button2, "class", "button delete");
    			add_location(button2, file, 235, 20, 7509);
    			attr_dev(div0, "class", "buttons");
    			add_location(div0, file, 228, 16, 6310);
    			attr_dev(div1, "class", "note-foot");
    			add_location(div1, file, 220, 12, 6000);
    			attr_dev(li, "class", "note");
    			attr_dev(li, "id", li_id_value = /*item*/ ctx[42].id);
    			add_location(li, file, 216, 8, 5817);
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
    							if (is_function(/*deleteModal*/ ctx[11](/*item*/ ctx[42].id))) /*deleteModal*/ ctx[11](/*item*/ ctx[42].id).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(button1, "click", click_handler_2, false, false, false),
    					listen_dev(
    						button2,
    						"click",
    						function () {
    							if (is_function(/*deleteArticle*/ ctx[15](/*item*/ ctx[42].id))) /*deleteArticle*/ ctx[15](/*item*/ ctx[42].id).apply(this, arguments);
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
    			if (dirty[0] & /*searchArticles*/ 256 && t0_value !== (t0_value = /*item*/ ctx[42].title + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*searchArticles*/ 256 && t2_value !== (t2_value = /*item*/ ctx[42].description + "")) set_data_dev(t2, t2_value);

    			if (dirty[0] & /*searchArticles*/ 256 && t4_value !== (t4_value = (/*item*/ ctx[42].category
    			? /*item*/ ctx[42].category.title
    			: "") + "")) set_data_dev(t4, t4_value);

    			if (/*item*/ ctx[42].keywords) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_4(ctx);
    					if_block.c();
    					if_block.m(div1, t6);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty[0] & /*searchArticles*/ 256 && li_id_value !== (li_id_value = /*item*/ ctx[42].id)) {
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
    		source: "(215:4) {#each searchArticles as item}",
    		ctx
    	});

    	return block;
    }

    // (250:0) {#if modalAdd }
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
    	let each_value = /*categories*/ ctx[12];
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
    			add_location(div0, file, 252, 8, 8454);
    			attr_dev(div1, "class", "icon-close close-modal");
    			add_location(div1, file, 255, 16, 8622);
    			attr_dev(h2, "class", "modal-h2");
    			add_location(h2, file, 256, 16, 8719);
    			attr_dev(h30, "class", "modal-h3");
    			add_location(h30, file, 257, 16, 8779);
    			attr_dev(input, "type", "text");
    			input.required = true;
    			add_location(input, file, 259, 20, 8873);
    			attr_dev(span0, "class", "text");
    			add_location(span0, file, 258, 16, 8832);
    			attr_dev(h31, "class", "modal-h3");
    			add_location(h31, file, 261, 16, 8971);
    			attr_dev(textarea0, "name", "note");
    			textarea0.required = true;
    			add_location(textarea0, file, 263, 20, 9065);
    			attr_dev(span1, "class", "text");
    			add_location(span1, file, 262, 16, 9024);
    			attr_dev(h32, "class", "modal-h3");
    			add_location(h32, file, 265, 16, 9183);
    			attr_dev(textarea1, "name", "keywords");
    			attr_dev(textarea1, "placeholder", "Ecrire les mots clefs séparés par une vigurle");
    			add_location(textarea1, file, 267, 20, 9302);
    			attr_dev(span2, "class", "text text-small");
    			add_location(span2, file, 266, 16, 9250);
    			attr_dev(h33, "class", "modal-h3");
    			add_location(h33, file, 269, 16, 9472);
    			if (/*article*/ ctx[10].category === void 0) add_render_callback(() => /*select_change_handler*/ ctx[27].call(select));
    			add_location(select, file, 271, 20, 9585);
    			attr_dev(span3, "class", "categories");
    			add_location(span3, file, 270, 16, 9538);
    			attr_dev(button0, "class", "button button-large");
    			add_location(button0, file, 280, 20, 9976);
    			attr_dev(button1, "type", "submit");
    			attr_dev(button1, "class", "button button-large");
    			add_location(button1, file, 281, 20, 10087);
    			attr_dev(div2, "class", "modal-foot");
    			add_location(div2, file, 279, 16, 9930);
    			attr_dev(div3, "class", "modal-wrap");
    			add_location(div3, file, 254, 12, 8580);
    			attr_dev(div4, "class", "modal-inner");
    			add_location(div4, file, 253, 8, 8541);
    			attr_dev(form, "class", "modal modal-add");
    			add_location(form, file, 251, 4, 8372);
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
    			set_input_value(input, /*article*/ ctx[10].title);
    			append_dev(div3, t6);
    			append_dev(div3, h31);
    			append_dev(div3, t8);
    			append_dev(div3, span1);
    			append_dev(span1, textarea0);
    			set_input_value(textarea0, /*article*/ ctx[10].description);
    			append_dev(div3, t9);
    			append_dev(div3, h32);
    			append_dev(div3, t11);
    			append_dev(div3, span2);
    			append_dev(span2, textarea1);
    			set_input_value(textarea1, /*article*/ ctx[10].keywords);
    			append_dev(div3, t12);
    			append_dev(div3, h33);
    			append_dev(div3, t14);
    			append_dev(div3, span3);
    			append_dev(span3, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*article*/ ctx[10].category);
    			append_dev(div3, t15);
    			append_dev(div3, div2);
    			append_dev(div2, button0);
    			append_dev(div2, t17);
    			append_dev(div2, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler_4*/ ctx[22], false, false, false),
    					listen_dev(div1, "click", /*click_handler_5*/ ctx[23], false, false, false),
    					listen_dev(input, "input", /*input_input_handler_1*/ ctx[24]),
    					listen_dev(textarea0, "input", /*textarea0_input_handler*/ ctx[25]),
    					listen_dev(textarea1, "input", /*textarea1_input_handler*/ ctx[26]),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[27]),
    					listen_dev(button0, "click", /*click_handler_6*/ ctx[28], false, false, false),
    					listen_dev(form, "submit", prevent_default(/*createArticle*/ ctx[13]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*article, categories*/ 5120 && input.value !== /*article*/ ctx[10].title) {
    				set_input_value(input, /*article*/ ctx[10].title);
    			}

    			if (dirty[0] & /*article, categories*/ 5120) {
    				set_input_value(textarea0, /*article*/ ctx[10].description);
    			}

    			if (dirty[0] & /*article, categories*/ 5120) {
    				set_input_value(textarea1, /*article*/ ctx[10].keywords);
    			}

    			if (dirty[0] & /*categories*/ 4096) {
    				each_value = /*categories*/ ctx[12];
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

    			if (dirty[0] & /*article, categories*/ 5120) {
    				select_option(select, /*article*/ ctx[10].category);
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
    		source: "(250:0) {#if modalAdd }",
    		ctx
    	});

    	return block;
    }

    // (273:24) {#each categories as category}
    function create_each_block(ctx) {
    	let option;
    	let t0_value = /*category*/ ctx[39].title + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = /*category*/ ctx[39];
    			option.value = option.__value;
    			add_location(option, file, 273, 28, 9709);
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
    		source: "(273:24) {#each categories as category}",
    		ctx
    	});

    	return block;
    }

    // (290:0) {#if modalEdit}
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
    			add_location(div0, file, 292, 4, 10345);
    			attr_dev(div1, "class", "icon-close");
    			add_location(div1, file, 295, 12, 10489);
    			attr_dev(h2, "class", "modal-h2");
    			add_location(h2, file, 296, 12, 10571);
    			attr_dev(h30, "class", "modal-h3");
    			add_location(h30, file, 297, 12, 10628);
    			attr_dev(input0, "type", "text");
    			input0.required = true;
    			add_location(input0, file, 299, 20, 10722);
    			attr_dev(span0, "class", "text");
    			add_location(span0, file, 298, 16, 10681);
    			attr_dev(h31, "class", "modal-h3");
    			add_location(h31, file, 301, 12, 10823);
    			attr_dev(textarea0, "name", "note");
    			attr_dev(textarea0, "placeholder", "Ecrire votre note...");
    			textarea0.required = true;
    			add_location(textarea0, file, 303, 16, 10909);
    			attr_dev(span1, "class", "text");
    			add_location(span1, file, 302, 12, 10872);
    			attr_dev(h32, "class", "modal-h3");
    			add_location(h32, file, 305, 12, 11061);
    			attr_dev(textarea1, "name", "keywords");
    			attr_dev(textarea1, "placeholder", "Ecrire les mots clefs séparés par une vigurle");
    			add_location(textarea1, file, 307, 16, 11172);
    			attr_dev(span2, "class", "text text-small");
    			add_location(span2, file, 306, 12, 11124);
    			attr_dev(h33, "class", "modal-h3");
    			add_location(h33, file, 309, 12, 11342);
    			attr_dev(input1, "type", "checkbox");
    			attr_dev(input1, "name", "category");
    			input1.value = "categorie-1";
    			add_location(input1, file, 312, 20, 11477);
    			add_location(span3, file, 313, 20, 11558);
    			add_location(label, file, 311, 16, 11448);
    			attr_dev(span4, "class", "categories");
    			add_location(span4, file, 310, 12, 11405);
    			attr_dev(button0, "class", "button button-large");
    			add_location(button0, file, 317, 16, 11685);
    			attr_dev(button1, "type", "submit");
    			attr_dev(button1, "class", "button button-large");
    			add_location(button1, file, 318, 16, 11793);
    			attr_dev(div2, "class", "modal-foot");
    			add_location(div2, file, 316, 12, 11643);
    			attr_dev(div3, "class", "modal-wrap");
    			add_location(div3, file, 294, 7, 10451);
    			attr_dev(div4, "class", "modal-inner");
    			add_location(div4, file, 293, 4, 10417);
    			attr_dev(form, "class", "modal modal-edit");
    			add_location(form, file, 291, 0, 10266);
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
    			set_input_value(input0, /*updatedArticle*/ ctx[9].title);
    			append_dev(div3, t6);
    			append_dev(div3, h31);
    			append_dev(div3, t8);
    			append_dev(div3, span1);
    			append_dev(span1, textarea0);
    			set_input_value(textarea0, /*updatedArticle*/ ctx[9].description);
    			append_dev(div3, t9);
    			append_dev(div3, h32);
    			append_dev(div3, t11);
    			append_dev(div3, span2);
    			append_dev(span2, textarea1);
    			set_input_value(textarea1, /*updatedArticle*/ ctx[9].keywords);
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
    					listen_dev(div0, "click", /*click_handler_7*/ ctx[29], false, false, false),
    					listen_dev(div1, "click", /*click_handler_8*/ ctx[30], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[31]),
    					listen_dev(textarea0, "input", /*textarea0_input_handler_1*/ ctx[32]),
    					listen_dev(textarea1, "input", /*textarea1_input_handler_1*/ ctx[33]),
    					listen_dev(button0, "click", /*click_handler_9*/ ctx[34], false, false, false),
    					listen_dev(form, "submit", prevent_default(/*updateArticle*/ ctx[14]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*updatedArticle*/ 512 && input0.value !== /*updatedArticle*/ ctx[9].title) {
    				set_input_value(input0, /*updatedArticle*/ ctx[9].title);
    			}

    			if (dirty[0] & /*updatedArticle*/ 512) {
    				set_input_value(textarea0, /*updatedArticle*/ ctx[9].description);
    			}

    			if (dirty[0] & /*updatedArticle*/ 512) {
    				set_input_value(textarea1, /*updatedArticle*/ ctx[9].keywords);
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
    		source: "(290:0) {#if modalEdit}",
    		ctx
    	});

    	return block;
    }

    // (327:0) {#if modalDelete}
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
    			add_location(div0, file, 329, 8, 11995);
    			attr_dev(div1, "class", "icon-close close-modal");
    			add_location(div1, file, 332, 16, 12155);
    			attr_dev(span, "class", "text");
    			add_location(span, file, 333, 16, 12215);
    			attr_dev(button0, "class", "button button-large");
    			add_location(button0, file, 337, 20, 12389);
    			attr_dev(button1, "class", "button button-large");
    			add_location(button1, file, 338, 20, 12503);
    			attr_dev(div2, "class", "modal-foot");
    			add_location(div2, file, 336, 16, 12343);
    			attr_dev(div3, "class", "modal-wrap");
    			add_location(div3, file, 331, 12, 12113);
    			attr_dev(div4, "class", "modal-inner");
    			add_location(div4, file, 330, 8, 12074);
    			attr_dev(div5, "class", "modal modal-delete");
    			add_location(div5, file, 328, 4, 11953);
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
    					listen_dev(div0, "click", /*click_handler_10*/ ctx[35], false, false, false),
    					listen_dev(button0, "click", /*click_handler_11*/ ctx[36], false, false, false)
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
    		source: "(327:0) {#if modalDelete}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let link;
    	let t0;
    	let nav;
    	let ul3;
    	let li0;
    	let ul0;
    	let t1;
    	let li3;
    	let ul1;
    	let li1;
    	let t3;
    	let li2;
    	let t5;
    	let li4;
    	let ul2;
    	let t6;
    	let header;
    	let div0;
    	let span;
    	let input;
    	let t7;
    	let img0;
    	let img0_src_value;
    	let t8;
    	let main;
    	let ul4;
    	let t9;
    	let div1;
    	let img1;
    	let img1_src_value;
    	let t10;
    	let t11;
    	let t12;
    	let if_block5_anchor;
    	let mounted;
    	let dispose;
    	let if_block0 = /*listCategories*/ ctx[3] && create_if_block_6(ctx);
    	let if_block1 = /*listKeywords*/ ctx[4] && create_if_block_5(ctx);
    	let if_block2 = /*searchArticles*/ ctx[8] && create_if_block_3(ctx);
    	let if_block3 = /*modalAdd*/ ctx[5] && create_if_block_2(ctx);
    	let if_block4 = /*modalEdit*/ ctx[6] && create_if_block_1(ctx);
    	let if_block5 = /*modalDelete*/ ctx[7] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			link = element("link");
    			t0 = space();
    			nav = element("nav");
    			ul3 = element("ul");
    			li0 = element("li");
    			ul0 = element("ul");
    			if (if_block0) if_block0.c();
    			t1 = space();
    			li3 = element("li");
    			ul1 = element("ul");
    			li1 = element("li");
    			li1.textContent = "Notes";
    			t3 = space();
    			li2 = element("li");
    			li2.textContent = "Vérouillé";
    			t5 = space();
    			li4 = element("li");
    			ul2 = element("ul");
    			if (if_block1) if_block1.c();
    			t6 = space();
    			header = element("header");
    			div0 = element("div");
    			span = element("span");
    			input = element("input");
    			t7 = space();
    			img0 = element("img");
    			t8 = space();
    			main = element("main");
    			ul4 = element("ul");
    			if (if_block2) if_block2.c();
    			t9 = space();
    			div1 = element("div");
    			img1 = element("img");
    			t10 = space();
    			if (if_block3) if_block3.c();
    			t11 = space();
    			if (if_block4) if_block4.c();
    			t12 = space();
    			if (if_block5) if_block5.c();
    			if_block5_anchor = empty();
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "https://fonts.googleapis.com/icon?family=Material+Icons");
    			add_location(link, file, 0, 0, 0);
    			attr_dev(ul0, "class", "nav-links");
    			add_location(ul0, file, 166, 12, 4535);
    			add_location(li0, file, 165, 8, 4517);
    			add_location(li1, file, 181, 16, 4965);
    			add_location(li2, file, 182, 16, 4997);
    			attr_dev(ul1, "class", "nav-links");
    			add_location(ul1, file, 180, 12, 4925);
    			add_location(li3, file, 179, 8, 4907);
    			attr_dev(ul2, "class", "keywords");
    			add_location(ul2, file, 186, 12, 5077);
    			add_location(li4, file, 185, 8, 5059);
    			add_location(ul3, file, 164, 4, 4503);
    			add_location(nav, file, 163, 0, 4492);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "name", "");
    			attr_dev(input, "placeholder", "Rechercher...");
    			add_location(input, file, 203, 12, 5503);
    			if (!src_url_equal(img0.src, img0_src_value = "./img/search.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "search");
    			add_location(img0, file, 204, 12, 5598);
    			attr_dev(span, "class", "search-input");
    			add_location(span, file, 202, 8, 5462);
    			attr_dev(div0, "class", "header-contain");
    			add_location(div0, file, 201, 4, 5424);
    			add_location(header, file, 200, 0, 5410);
    			attr_dev(ul4, "class", "notes");
    			add_location(ul4, file, 210, 4, 5698);
    			if (!src_url_equal(img1.src, img1_src_value = "./img/add.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "plus");
    			add_location(img1, file, 245, 58, 8290);
    			attr_dev(div1, "class", "more");
    			add_location(div1, file, 245, 4, 8236);
    			add_location(main, file, 209, 0, 5686);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, nav, anchor);
    			append_dev(nav, ul3);
    			append_dev(ul3, li0);
    			append_dev(li0, ul0);
    			if (if_block0) if_block0.m(ul0, null);
    			append_dev(ul3, t1);
    			append_dev(ul3, li3);
    			append_dev(li3, ul1);
    			append_dev(ul1, li1);
    			append_dev(ul1, t3);
    			append_dev(ul1, li2);
    			append_dev(ul3, t5);
    			append_dev(ul3, li4);
    			append_dev(li4, ul2);
    			if (if_block1) if_block1.m(ul2, null);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, header, anchor);
    			append_dev(header, div0);
    			append_dev(div0, span);
    			append_dev(span, input);
    			set_input_value(input, /*searchTerm*/ ctx[0]);
    			append_dev(span, t7);
    			append_dev(span, img0);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, ul4);
    			if (if_block2) if_block2.m(ul4, null);
    			append_dev(main, t9);
    			append_dev(main, div1);
    			append_dev(div1, img1);
    			insert_dev(target, t10, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, t11, anchor);
    			if (if_block4) if_block4.m(target, anchor);
    			insert_dev(target, t12, anchor);
    			if (if_block5) if_block5.m(target, anchor);
    			insert_dev(target, if_block5_anchor, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[19]),
    					listen_dev(div1, "click", /*click_handler_3*/ ctx[21], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*listCategories*/ ctx[3]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_6(ctx);
    					if_block0.c();
    					if_block0.m(ul0, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*listKeywords*/ ctx[4]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_5(ctx);
    					if_block1.c();
    					if_block1.m(ul2, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty[0] & /*searchTerm*/ 1 && input.value !== /*searchTerm*/ ctx[0]) {
    				set_input_value(input, /*searchTerm*/ ctx[0]);
    			}

    			if (/*searchArticles*/ ctx[8]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_3(ctx);
    					if_block2.c();
    					if_block2.m(ul4, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*modalAdd*/ ctx[5]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_2(ctx);
    					if_block3.c();
    					if_block3.m(t11.parentNode, t11);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*modalEdit*/ ctx[6]) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_1(ctx);
    					if_block4.c();
    					if_block4.m(t12.parentNode, t12);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (/*modalDelete*/ ctx[7]) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);
    				} else {
    					if_block5 = create_if_block(ctx);
    					if_block5.c();
    					if_block5.m(if_block5_anchor.parentNode, if_block5_anchor);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(nav);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(header);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(main);
    			if (if_block2) if_block2.d();
    			if (detaching) detach_dev(t10);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(t11);
    			if (if_block4) if_block4.d(detaching);
    			if (detaching) detach_dev(t12);
    			if (if_block5) if_block5.d(detaching);
    			if (detaching) detach_dev(if_block5_anchor);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ListArticles', slots, []);
    	let listArticles, listCategories, listKeywords = [];
    	let modalAdd, modalEdit, modalDelete = false;
    	let deleteModal = true;
    	let searchTerm = "";
    	let searchArticles = [];
    	let updatedArticle = {};
    	let lockStatut, categoryFilter, keywordFilter, lockFilter = "";

    	let article = {
    		id: undefined,
    		title: '',
    		description: '',
    		category: '',
    		status: '',
    		created: undefined,
    		updated: undefined
    	};

    	let categories = [{ title: "Design" }, { title: "Webdesign" }];
    	listCategories = [{ title: "Developpement" }, { title: "Design" }];

    	if (typeof localStorage.getItem("notes") !== 'undefined') {
    		listArticles = JSON.parse(localStorage.getItem("notes"));

    		if (listArticles) {
    			for (const listItem of listArticles) {
    				if (typeof listItem.keywords !== 'undefined') {
    					console.log(listItem.keywords);

    					for (const keyword of listItem.keywords) {
    						listKeywords.push(keyword);
    					}
    				}

    				if (typeof listItem.category.title !== 'undefined') {
    					console.log(listItem.category.title);

    					//listCategories.push(listItem.category.title);
    					listCategories = [...listCategories, listItem.category.title];
    				}
    			}

    			listCategories = [...new Set(listCategories)];
    			listKeywords = [...new Set(listKeywords)];
    		}
    	}

    	const createArticle = () => {
    		if (!article.title.trim()) {
    			$$invalidate(10, article.title = '', article);
    			return;
    		}

    		article.description != '' || !article.description.trim()
    		? $$invalidate(10, article.status = 'brouillon', article)
    		: $$invalidate(10, article.status = 'archive', article);

    		$$invalidate(10, article.id = Date.now(), article);
    		$$invalidate(10, article.created = new Date().toLocaleDateString("fr"), article);

    		if (typeof article.keywords !== 'undefined') {
    			if (article.keywords.includes(',')) {
    				$$invalidate(10, article.keywords = article.keywords.split(','), article);
    			} else {
    				$$invalidate(10, article.keywords = article.keywords.split(" "), article);
    			}
    		}

    		$$invalidate(16, listArticles = [...listArticles, article]);

    		$$invalidate(10, article = {
    			id: undefined,
    			title: '',
    			description: '',
    			category: '',
    			status: '',
    			keywords: []
    		});

    		$$invalidate(5, modalAdd = false);
    	};

    	const updateArticle = () => {
    		const productIndex = listArticles.findIndex(p => p.id === updatedArticle.id);

    		updatedArticle.description == '' || !updatedArticle.description.trim()
    		? $$invalidate(9, updatedArticle.status = 'brouillon', updatedArticle)
    		: $$invalidate(9, updatedArticle.status = 'archive', updatedArticle);

    		$$invalidate(9, updatedArticle.updated = new Date().toLocaleDateString("fr"), updatedArticle);
    		$$invalidate(16, listArticles[productIndex] = updatedArticle, listArticles);
    		isNew = true;
    		$$invalidate(9, updatedArticle = {});
    		$$invalidate(6, modalEdit = false);
    	};

    	const deleteArticle = id => {
    		$$invalidate(16, listArticles = listArticles.filter(item => item.id !== id));
    		$$invalidate(7, modalDelete = false);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<ListArticles> was created with unknown prop '${key}'`);
    	});

    	const click_handler = category => {
    		$$invalidate(1, categoryFilter = category.title);
    	};

    	const click_handler_1 = keyword => {
    		$$invalidate(2, keywordFilter = keyword);
    	};

    	function input_input_handler() {
    		searchTerm = this.value;
    		$$invalidate(0, searchTerm);
    	}

    	const click_handler_2 = item => {
    		$$invalidate(6, modalEdit = true);
    		$$invalidate(9, updatedArticle = item);
    	};

    	const click_handler_3 = () => {
    		$$invalidate(5, modalAdd = true);
    	};

    	const click_handler_4 = () => {
    		$$invalidate(5, modalAdd = false);
    	};

    	const click_handler_5 = () => {
    		$$invalidate(5, modalAdd = false);
    	};

    	function input_input_handler_1() {
    		article.title = this.value;
    		$$invalidate(10, article);
    		$$invalidate(12, categories);
    	}

    	function textarea0_input_handler() {
    		article.description = this.value;
    		$$invalidate(10, article);
    		$$invalidate(12, categories);
    	}

    	function textarea1_input_handler() {
    		article.keywords = this.value;
    		$$invalidate(10, article);
    		$$invalidate(12, categories);
    	}

    	function select_change_handler() {
    		article.category = select_value(this);
    		$$invalidate(10, article);
    		$$invalidate(12, categories);
    	}

    	const click_handler_6 = () => {
    		$$invalidate(5, modalAdd = false);
    	};

    	const click_handler_7 = () => {
    		$$invalidate(6, modalEdit = false);
    	};

    	const click_handler_8 = () => {
    		$$invalidate(6, modalEdit = false);
    	};

    	function input0_input_handler() {
    		updatedArticle.title = this.value;
    		$$invalidate(9, updatedArticle);
    	}

    	function textarea0_input_handler_1() {
    		updatedArticle.description = this.value;
    		$$invalidate(9, updatedArticle);
    	}

    	function textarea1_input_handler_1() {
    		updatedArticle.keywords = this.value;
    		$$invalidate(9, updatedArticle);
    	}

    	const click_handler_9 = () => {
    		$$invalidate(6, modalEdit = false);
    	};

    	const click_handler_10 = () => {
    		$$invalidate(7, modalDelete = false);
    	};

    	const click_handler_11 = () => {
    		$$invalidate(7, modalDelete = false);
    	};

    	$$self.$capture_state = () => ({
    		listArticles,
    		listCategories,
    		listKeywords,
    		modalAdd,
    		modalEdit,
    		modalDelete,
    		deleteModal,
    		searchTerm,
    		searchArticles,
    		updatedArticle,
    		lockStatut,
    		categoryFilter,
    		keywordFilter,
    		lockFilter,
    		article,
    		categories,
    		createArticle,
    		updateArticle,
    		deleteArticle
    	});

    	$$self.$inject_state = $$props => {
    		if ('listArticles' in $$props) $$invalidate(16, listArticles = $$props.listArticles);
    		if ('listCategories' in $$props) $$invalidate(3, listCategories = $$props.listCategories);
    		if ('listKeywords' in $$props) $$invalidate(4, listKeywords = $$props.listKeywords);
    		if ('modalAdd' in $$props) $$invalidate(5, modalAdd = $$props.modalAdd);
    		if ('modalEdit' in $$props) $$invalidate(6, modalEdit = $$props.modalEdit);
    		if ('modalDelete' in $$props) $$invalidate(7, modalDelete = $$props.modalDelete);
    		if ('deleteModal' in $$props) $$invalidate(11, deleteModal = $$props.deleteModal);
    		if ('searchTerm' in $$props) $$invalidate(0, searchTerm = $$props.searchTerm);
    		if ('searchArticles' in $$props) $$invalidate(8, searchArticles = $$props.searchArticles);
    		if ('updatedArticle' in $$props) $$invalidate(9, updatedArticle = $$props.updatedArticle);
    		if ('lockStatut' in $$props) $$invalidate(37, lockStatut = $$props.lockStatut);
    		if ('categoryFilter' in $$props) $$invalidate(1, categoryFilter = $$props.categoryFilter);
    		if ('keywordFilter' in $$props) $$invalidate(2, keywordFilter = $$props.keywordFilter);
    		if ('lockFilter' in $$props) $$invalidate(38, lockFilter = $$props.lockFilter);
    		if ('article' in $$props) $$invalidate(10, article = $$props.article);
    		if ('categories' in $$props) $$invalidate(12, categories = $$props.categories);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*listArticles*/ 65536) {
    			localStorage.setItem("notes", JSON.stringify(listArticles));
    		}

    		if ($$self.$$.dirty[0] & /*listArticles, categoryFilter*/ 65538) {
    			$$invalidate(8, searchArticles = listArticles.filter(art => {
    				if (typeof art.category.title == 'undefined') {
    					return;
    				}

    				return art.category.title.includes(categoryFilter);
    			}));
    		}

    		if ($$self.$$.dirty[0] & /*listArticles, keywordFilter*/ 65540) {
    			$$invalidate(8, searchArticles = listArticles.filter(art => {
    				if (typeof art.keywords == 'undefined') {
    					return;
    				}

    				return art.keywords.includes(keywordFilter);
    			}));
    		}

    		if ($$self.$$.dirty[0] & /*listArticles*/ 65536) {
    			$$invalidate(8, searchArticles = listArticles.filter(art => {
    				let lockStatut = lockFilter ? "brouillon" : "archive";

    				if (typeof art.status == 'undefined') {
    					return;
    				}

    				return art.status.includes(lockStatut);
    			}));
    		}

    		if ($$self.$$.dirty[0] & /*listArticles, searchTerm*/ 65537) {
    			$$invalidate(8, searchArticles = listArticles.filter(art => {
    				if (art.description) {
    					return art.title.includes(searchTerm) || art.description.includes(searchTerm);
    				}

    				return art.title.includes(searchTerm);
    			}));
    		}
    	};

    	return [
    		searchTerm,
    		categoryFilter,
    		keywordFilter,
    		listCategories,
    		listKeywords,
    		modalAdd,
    		modalEdit,
    		modalDelete,
    		searchArticles,
    		updatedArticle,
    		article,
    		deleteModal,
    		categories,
    		createArticle,
    		updateArticle,
    		deleteArticle,
    		listArticles,
    		click_handler,
    		click_handler_1,
    		input_input_handler,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		input_input_handler_1,
    		textarea0_input_handler,
    		textarea1_input_handler,
    		select_change_handler,
    		click_handler_6,
    		click_handler_7,
    		click_handler_8,
    		input0_input_handler,
    		textarea0_input_handler_1,
    		textarea1_input_handler_1,
    		click_handler_9,
    		click_handler_10,
    		click_handler_11
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
