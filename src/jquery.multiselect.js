/* jshint forin:true, noarg:true, noempty:true, eqeqeq:true, boss:true, undef:true, curly:true, browser:true, jquery:true */
/*
* jQuery MultiSelect UI Widget 1.14pre
* Copyright (c) 2012 Eric Hynds
*
* http://www.erichynds.com/jquery/jquery-ui-multiselect-widget/
*
* Depends:
*   - jQuery 1.4.2+
*   - jQuery UI 1.8 widget factory
*
* Optional:
*   - jQuery UI effects
*   - jQuery UI position utility
*
* Dual licensed under the MIT and GPL licenses:
*   http://www.opensource.org/licenses/mit-license.php
*   http://www.gnu.org/licenses/gpl.html
*
*/

(function ($, undefined) {

    var multiselectID = 0;

    $.widget("ech.multiselect", {

        // default options
        options: {
            header: true,
            height: 175,
            minWidth: 225,
            minMenuWidth: 225,
            maxMenuWidth: 450,
            maxWidth: null,
            triggerOnCancel: false,
            classes: '',
            checkAllText: 'Check all',
            uncheckAllText: 'Uncheck all',
            noneSelectedText: 'Select options',
            selectedText: '# selected',
            selectedList: 0,
            show: null,
            hide: null,
            autoOpen: false,
            multiple: true,
            optimize: false,
            closeText: '',
            position: {}
        },

        _create: function () {
            var el = this.element.hide(),
			    o = this.options;

            // if multiple select make sure the element has the multiple attribute
            if (o.multiple) {
                el.attr('multiple', 'multiple');
                el.val(null);
            }

            this.speed = $.fx.speeds._default; // default speed for effects
            this._isOpen = false; // assume no

            var 
			button = (this.button = $('<button type="button"><span class="ui-icon ui-icon-triangle-2-n-s"></span></button>'))
				.addClass('ui-multiselect ui-widget ui-state-default ui-corner-all')
				.addClass(o.classes)
				.attr({ 'title': el.attr('title'), 'aria-haspopup': true, 'tabIndex': el.attr('tabIndex') })
				.insertAfter(el),

			buttonlabel = (this.buttonlabel = $('<span />'))
				.html(o.noneSelectedText)
				.appendTo(button),

			menu = (this.menu = $('<div />'))
				.addClass('ui-multiselect-menu ui-widget ui-widget-content ui-corner-all')
				.addClass(o.classes)
				.appendTo(document.body),

			header = (this.header = $('<div />'))
				.addClass('ui-widget-header ui-corner-all ui-multiselect-header ui-helper-clearfix')
				.appendTo(menu),

			headerLinkContainer = (this.headerLinkContainer = $('<ul />'))
				.addClass('ui-helper-reset')
				.html(function () {
				    if (o.header === true) {
				        return '<li><a class="ui-multiselect-all" href="#"><span class="ui-icon ui-icon-check"></span><span>' + o.checkAllText + '</span></a></li><li><a class="ui-multiselect-none" href="#"><span class="ui-icon ui-icon-closethick"></span><span>' + o.uncheckAllText + '</span></a></li>';
				    } else if (typeof o.header === "string") {
				        return '<li>' + o.header + '</li>';
				    } else {
				        return '';
				    }
				})
				.append('<li class="ui-multiselect-close"><a href="#" class="ui-multiselect-close"><span class="ui-icon ui-icon-circle-close"></span><span>' + o.closeText + '</span></a></li>')
				.appendTo(header),

            checkboxContainer = (this.checkboxContainer = $('<ul />'))
				.addClass('ui-multiselect-checkboxes ui-helper-reset')
				.appendTo(menu);

            // perform event bindings
            this._bindEvents();

            // build menu
            this.refresh(true);

            // some addl. logic for single selects
            if (!o.multiple) {
                menu.addClass('ui-multiselect-single');
            }
        },

        _init: function () {
            if (this.options.header === false) {
                this.header.hide();
            }
            if (!this.options.multiple) {
                this.headerLinkContainer.find('.ui-multiselect-all, .ui-multiselect-none').hide();
            }
            if (this.options.autoOpen) {
                this.open();
            }
            if (this.element.is(':disabled')) {
                this.disable();
            }
        },

        refresh: function (init) {
            var el = this.element,
			o = this.options,
			menu = this.menu,
			checkboxContainer = this.checkboxContainer,
			optgroups = [],
			html = "",
			id = el.attr('name') + '-' + multiselectID++; // unique ID for the label & option tags
            //I have observed a bug where options are selcted but the jquery .is method does not see it because the selected attribute is missing
            //from markup.
            $(':selected', el).attr('selected', 'selected');
            // build items
            el.find('option').each(function (i) {
                var $this = $(this),
				parent = this.parentNode,
				title = this.innerHTML,
				description = this.title,
				value = this.value,
				inputID = 'ui-multiselect-' + (this.id || id + '-option-' + i),
				isDisabled = $(this.outerHTML).is(':disabled'),
				isSelected = $(this.outerHTML).is(':selected'),
				labelClasses = ['ui-corner-all'],
				liClasses = (isDisabled ? 'ui-multiselect-disabled ' : ' ') + this.className,
				optLabel;

                $this.prop('disabled', isDisabled);
                $this.prop('selected', isSelected);

                // is this an optgroup?
                if (parent.tagName === 'OPTGROUP') {
                    optLabel = parent.getAttribute('label');

                    // has this optgroup been added already?
                    if ($.inArray(optLabel, optgroups) === -1) {
                        html += '<li class="ui-multiselect-optgroup-label ' + parent.className + '"><a href="#">' + optLabel + '</a></li>';
                        optgroups.push(optLabel);
                    }
                }

                if (isDisabled) {
                    labelClasses.push('ui-state-disabled');
                }

                // browsers automatically select the first option
                // by default with single selects
                if (isSelected && !o.multiple) {
                    labelClasses.push('ui-state-active');
                }

                html += '<li class="' + liClasses + '">';

                // create the label
                html += '<label for="' + inputID + '" title="' + description + '" class="' + labelClasses.join(' ') + '">';
                html += '<input id="' + inputID + '" name="multiselect_' + id + '" type="' + (o.multiple ? "checkbox" : "radio") + '" value="' + value + '" title="' + title + '"';

                // pre-selected?
                if (isSelected) {
                    html += ' checked="checked"';
                    html += ' selected="true" aria-selected="true"';
                }

                // disabled?
                if (isDisabled) {
                    html += ' disabled="disabled"';
                    html += ' aria-disabled="true"';
                }

                // add the title and close everything off
                html += ' /><span>' + title + '</span></label></li>';
            });

            // insert into the DOM
            checkboxContainer.html(html);

            // cache some moar useful elements
            this.labels = menu.find('label');
            this.inputs = this.labels.children('input');

            // set widths
            this._setButtonWidth();
            this._setMenuWidth();

            // remember default value
            this.button[0].defaultValue = this.update();

            // broadcast refresh event; useful for widgets
            if (!init) {
                this._trigger('refresh');
            }
        },

        // updates the button text. call refresh() to rebuild
        update: function () {
            var o = this.options,
			$inputs = this.inputs,
			$checked = $inputs.filter(':checked'),
			numChecked = $checked.length,
			value;

            if (numChecked === 0) {
                value = o.noneSelectedText;
            } else {
                if ($.isFunction(o.selectedText)) {
                    value = o.selectedText.call(this, numChecked, $inputs.length, $checked.get());
                } else if (/\d/.test(o.selectedList) && o.selectedList > 0 && numChecked <= o.selectedList) {
                    value = $checked.map(function () { return $(this).next().html(); }).get().join(', ');
                } else {
                    value = o.selectedText.replace('#', numChecked).replace('#', $inputs.length);
                }
            }

            this.buttonlabel.html(value);
            return value;
        },

        // check the selected items in the original select element
        _check: function (tags, val, checked) {
            var self = this, ele = null;
            tags.each(function () {
                if (self.options.optimize) {
                    checked = $('input[value="' + this.value + '"]', self.menu).prop('checked');
                    $(this).prop("selected", checked);
                    if (checked) {
                        $(this).attr('selected', 'selected');
                    } else {
                        $(this).removeAttr('selected');
                    }
                } else {
                    if (this.value === val) {
                        $(this).prop("selected", checked);
                        $(this).attr('selected', 'selected');
                    } else if (!self.options.multiple) {
                        $(this).prop("selected", false);
                        $(this).removeAttr('selected');
                    }
                }
            });

            // fire change on the select box
            self.element.trigger("change");

            // setTimeout is to fix multiselect issue #14 and #47. caused by jQuery issue #3827
            // http://bugs.jquery.com/ticket/3827
            setTimeout($.proxy(self.update, self), 10);
        },
        // binds events
        _bindEvents: function () {
            var self = this, button = this.button;

            function clickHandler(e) {
                if (!self._isOpen) {
                    self._setMenuWidth(e);
                }
                self[self._isOpen ? 'close' : 'open'](e, $(this));
                return false;
            }

            function resizeHandler() {
                alert('Button has been resized!');
            }

            // webkit doesn't like it when you click on the span :(
            button
			.find('span')
			.bind('click.multiselect', clickHandler);

            // button events
            button.bind({
                click: clickHandler,
                keypress: function (e) {
                    switch (e.which) {
                        case 27: // esc
                        case 38: // up
                        case 37: // left
                            self.close(false);
                            break;
                        case 39: // right
                        case 40: // down
                            self.open();
                            break;
                    }
                },
                mouseenter: function () {
                    if (!button.hasClass('ui-state-disabled')) {
                        $(this).addClass('ui-state-hover');
                    }
                },
                mouseleave: function () {
                    $(this).removeClass('ui-state-hover');
                },
                focus: function () {
                    if (!button.hasClass('ui-state-disabled')) {
                        $(this).addClass('ui-state-focus');
                    }
                },
                blur: function () {
                    $(this).removeClass('ui-state-focus');
                }
            });

            // header links
            this.header
			.delegate('a', 'click.multiselect', function (e) {
			    // close link
			    if ($(this).hasClass('ui-multiselect-close')) {
			        self.close(true);
			    } else {    /* check all / uncheck all */
			        self[$(this).hasClass('ui-multiselect-all') ? 'checkAll' : 'uncheckAll']();
			    }

			    e.preventDefault();
			});

            // optgroup label toggle support
            this.menu
			.delegate('li.ui-multiselect-optgroup-label a', 'click.multiselect', function (e) {
			    e.preventDefault();

			    var $this = $(this),
					$inputs = $this.parent().nextUntil('li.ui-multiselect-optgroup-label').find('input:visible:not(:disabled)'),
					nodes = $inputs.get(),
					label = $this.parent().text();

			    // trigger event and bail if the return is false
			    if (self._trigger('beforeoptgrouptoggle', e, { inputs: nodes, label: label }) === false) {
			        return;
			    }

			    // toggle inputs
			    self._toggleChecked(
					$inputs.filter(':checked').length !== $inputs.length,
					$inputs
				);

			    self._trigger('optgrouptoggle', e, {
			        inputs: nodes,
			        label: label,
			        checked: nodes[0].checked
			    });
			})
			.delegate('label', 'mouseenter.multiselect', function () {
			    if (!$(this).hasClass('ui-state-disabled')) {
			        self.labels.removeClass('ui-state-hover');
			        $(this).addClass('ui-state-hover').find('input').focus();
			    }
			})
			.delegate('label', 'keydown.multiselect', function (e) {
			    e.preventDefault();

			    switch (e.which) {
			        case 9: // tab
			        case 27: // esc
			            self.close(false);
			            break;
			        case 38: // up
			        case 40: // down
			        case 37: // left
			        case 39: // right
			            self._traverse(e.which, this);
			            break;
			        case 13: // enter
			            $(this).find('input')[0].click();
			            break;
			    }
			})
			.delegate('input[type="checkbox"], input[type="radio"]', 'click.multiselect', function (e) {
			    var $this = $(this),
					val = this.value,
					checked = this.checked,
					tags = self.element.find('option');

			    // bail if this input is disabled or the event is cancelled
			    if (this.disabled || self._trigger('click', e, { value: val, text: this.title, checked: checked }) === false) {
			        e.preventDefault();
			        return;
			    }

			    // make sure the input has focus. otherwise, the esc key
			    // won't close the menu after clicking an item.
			    $this.focus();

			    // toggle aria state
			    $this.attr('aria-selected', checked);

			    // some additional single select-specific logic
			    if (!self.options.multiple) {
			        self.labels.removeClass('ui-state-active');
			        $this.closest('label').toggleClass('ui-state-active', checked);

			        // close menu
			        self.close(true);
			    }

			    // change state on the original option tags
			    if (!self.options.optimize) {
			        self._check.call(self, tags, val, checked);
			    }
			});

            // close each widget when clicking on any other element/anywhere else on the page
            $(document).bind('mousedown.multiselect', function (e) {
                if (self._isOpen && !$.contains(self.menu[0], e.target) && !$.contains(self.button[0], e.target) && e.target !== self.button[0]) {
                    self.close(false);
                }
            });

            // deal with form resets.  the problem here is that buttons aren't
            // restored to their defaultValue prop on form reset, and the reset
            // handler fires before the form is actually reset.  delaying it a bit
            // gives the form inputs time to clear.
            $(this.element[0].form).bind('reset.multiselect', function () {
                setTimeout($.proxy(self.refresh, self), 10);
            });
        },

        // set button width
        _setButtonWidth: function () {
            var width = this.element.outerWidth(),
			o = this.options;

            if (/\d/.test(o.minWidth) && width < o.minWidth) {
                width = o.minWidth;
            } else if (/%/.test(o.minWidth)) {
                width = o.minWidth;
            }

            if (o.maxWidth !== null && /\d/.test(o.maxWidth)) {
                this.button.css('max-width', o.maxWidth);
            }

            // set widths
            this.button.width(width);
        },

        // set menu width
        _setMenuWidth: function () {
            var m = this.menu,
                o = this.options,
			    width = this.button.outerWidth() -
				    parseInt(m.css('padding-left'), 10) -
				    parseInt(m.css('padding-right'), 10) -
				    parseInt(m.css('border-right-width'), 10) -
				    parseInt(m.css('border-left-width'), 10);

            width = width || this.button.outerWidth();

            m.show();
            $('span', $('ul', m).last()).each(function (i, ele) {
                var w = $(ele).outerWidth();
                if (w > width && width < o.maxMenuWidth) {
                    width = (w < o.maxMenuWidth ? w : o.maxMenuWidth) + (m[0].offsetWidth - m[0].clientWidth);
                }
            });
            m.hide();

            m.width(((o.header && o.minMenuWidth > width)) ? o.minMenuWidth : width);
        },
        // move up or down within the menu
        _traverse: function (which, start) {
            var $start = $(start),
			moveToLast = which === 38 || which === 37,

            // select the first li that isn't an optgroup label / disabled
			$next = $start.parent()[moveToLast ? 'prevAll' : 'nextAll']('li:not(.ui-multiselect-disabled, .ui-multiselect-optgroup-label)')[moveToLast ? 'last' : 'first']();

            // if at the first/last element
            if (!$next.length) {
                var $container = this.menu.find('ul').last();

                // move to the first/last
                this.menu.find('label')[moveToLast ? 'last' : 'first']().trigger('mouseover');

                // set scroll position
                $container.scrollTop(moveToLast ? $container.height() : 0);

            } else {
                $next.find('label').trigger('mouseover');
            }
        },

        // This is an internal function to toggle the checked property and
        // other related attributes of a checkbox.
        //
        // The context of this function should be a checkbox; do not proxy it.
        _toggleState: function (prop, flag) {
            return function () {
                if (!this.disabled) {
                    this[prop] = flag;
                }

                if (this.localName === 'option') {
                    $(this).prop("selected", flag);
                } else if (flag) {
                    this.setAttribute('aria-selected', true);
                } else {
                    this.removeAttribute('aria-selected');
                }
            };
        },

        _toggleChecked: function (flag, group) {
            var $inputs = (group && group.length) ? group : this.inputs,
			self = this;

            // toggle state on inputs
            $inputs.each(this._toggleState('checked', flag));

            // give the first input focus
            $inputs.eq(0).focus();

            // update button text
            this.update();

            // gather an array of the values that actually changed
            var values = $inputs.map(function () {
                return this.value;
            }).get();

            // toggle state on original option tags
            this.element
			.find('option')
			.each(function () {
			    if (!this.disabled && $.inArray(this.value, values) > -1) {
			        self._toggleState('selected', flag).call(this);
			    }
			});

            // trigger the change event on the select
            if ($inputs.length) {
                this.element.trigger("change");
            }
        },

        _toggleDisabled: function (flag) {
            this.button
			.attr({ 'disabled': flag, 'aria-disabled': flag })[flag ? 'addClass' : 'removeClass']('ui-state-disabled');

            var inputs = this.menu.find('input');
            var key = "ech-multiselect-disabled";

            if (flag) {
                // remember which elements this widget disabled (not pre-disabled)
                // elements, so that they can be restored if the widget is re-enabled.
                inputs = inputs.filter(':enabled')
				.data(key, true)
            } else {
                inputs = inputs.filter(function () {
                    return $.data(this, key) === true;
                }).removeData(key);
            }

            inputs
			.attr({ 'disabled': flag, 'arial-disabled': flag })
			.parent()[flag ? 'addClass' : 'removeClass']('ui-state-disabled');

            this.element
			.attr({ 'disabled': flag, 'aria-disabled': flag });
        },

        // open the menu
        open: function (e, btn) {
            var self = this,
			button = btn || this.button,
			menu = this.menu,
			speed = this.speed,
			o = this.options,
			args = [];

            // bail if the multiselectopen event returns false, this widget is disabled, or is already open
            if (this._trigger('beforeopen') === false || button.hasClass('ui-state-disabled') || this._isOpen) {
                return;
            }

            var $container = menu.find('ul').last(),
			effect = o.show,
			pos = button.offset();

            // figure out opening effects/speeds
            if ($.isArray(o.show)) {
                effect = o.show[0];
                speed = o.show[1] || self.speed;
            }

            // if there's an effect, assume jQuery UI is in use
            // build the arguments to pass to show()
            if (effect) {
                args = [effect, speed];
            }

            // set the scroll of the checkbox container
            $container.scrollTop(0).height(o.height);

            // position and show menu
            if ($.ui.position) {
                o.position.my = o.position.my || 'left top';
                o.position.at = o.position.at || 'left bottom';
                o.position.of = o.position.of || button;

                menu
				.show()
				.position(o.position)
				.hide();

                // if position utility is not available...
            } else {
                menu.css({
                    top: pos.top + button.outerHeight(),
                    left: pos.left
                });
            }

            // show the menu, maybe with a speed/effect combo
            $.fn.show.apply(menu, args);

            // select the first option
            // triggering both mouseover and mouseover because 1.4.2+ has a bug where triggering mouseover
            // will actually trigger mouseenter.  the mouseenter trigger is there for when it's eventually fixed
            this.labels.eq(0).trigger('mouseover').trigger('mouseenter').find('input').trigger('focus');

            button.addClass('ui-state-active');
            this._isOpen = true;
            this._trigger('open');
        },

        // close the menu
        close: function (set) {
            if (this._trigger('beforeclose') === false) {
                return;
            }

            var o = this.options,
		        effect = o.hide,
		        speed = this.speed,
		        args = [];

            if (o.optimize) {   /* when optimized we save all the changes until we close. */
                if ((o.triggerOnCancel && !set) || set) {
                    this._check.call(this, this.element.find('option'));
                } else {
                    this.refresh.call(this);
                }
            }

            // figure out opening effects/speeds
            if ($.isArray(o.hide)) {
                effect = o.hide[0];
                speed = o.hide[1] || this.speed;
            }

            if (effect) {
                args = [effect, speed];
            }

            $.fn.hide.apply(this.menu, args);
            this.button.removeClass('ui-state-active').trigger('blur').trigger('mouseleave');
            this._isOpen = false;
            if ((o.triggerOnCancel && !set) || set) {
                this._trigger('close');
            }
        },

        enable: function () {
            this._toggleDisabled(false);
        },

        disable: function () {
            this._toggleDisabled(true);
        },

        checkAll: function (e) {
            this._toggleChecked(true);
            this._trigger('checkAll');
        },

        uncheckAll: function () {
            this._toggleChecked(false);
            this._trigger('uncheckAll');
        },

        getChecked: function () {
            return this.menu.find('input').filter(':checked');
        },

        destroy: function () {
            // remove classes + data
            $.Widget.prototype.destroy.call(this);

            this.button.remove();
            this.menu.remove();
            this.element.show();

            return this;
        },

        isOpen: function () {
            return this._isOpen;
        },

        widget: function () {
            return this.menu;
        },

        getButton: function () {
            return this.button;
        },

        // react to option changes after initialization
        _setOption: function (key, value) {
            var menu = this.menu;

            switch (key) {
                case 'header':
                    menu.find('div.ui-multiselect-header')[value ? 'show' : 'hide']();
                    break;
                case 'checkAllText':
                    menu.find('a.ui-multiselect-all span').eq(-1).text(value);
                    break;
                case 'uncheckAllText':
                    menu.find('a.ui-multiselect-none span').eq(-1).text(value);
                    break;
                case 'height':
                    menu.find('ul').last().height(parseInt(value, 10));
                    break;
                case 'minWidth':
                    this.options[key] = parseInt(value, 10);
                    this._setButtonWidth();
                    this._setMenuWidth();
                    break;
                case 'selectedText':
                case 'selectedList':
                case 'noneSelectedText':
                    this.options[key] = value; // these all needs to update immediately for the update() call
                    this.update();
                    break;
                case 'classes':
                    menu.add(this.button).removeClass(this.options.classes).addClass(value);
                    break;
                case 'multiple':
                    menu.toggleClass('ui-multiselect-single', !value);
                    this.options.multiple = value;
                    this.element[0].multiple = value;
                    this.refresh();
            }

            $.Widget.prototype._setOption.apply(this, arguments);
        }
    });

    $.widget.bridge("ech_multiselect", $.ech.multiselect);
})(jQuery);
