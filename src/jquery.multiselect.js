/* jshint forin:true, noarg:true, noempty:true, eqeqeq:true, boss:true, undef:true, curly:true, browser:true, jquery:true */
/*
 * jQuery MultiSelect UI Widget 1.15
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

	var multiselectID = 0,
	$doc = $(document);

	$.widget("ech.multiselect", {

		// default options
		options: {
			header: true,
			height: 175,
			minWidth: 225,
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
			position: {},
			appendTo: "body",
			optGroupSelectable: false,
			optGroupCollapsible: false
		},

		_create: function () {
			// fix the width of the drop down to its initial rendered width
			var el = this.element.width(this.element.width()).hide(),
			o = this.options;

			this.speed = $.fx.speeds._default; // default speed for effects
			this._isOpen = false; // assume no

			this.viewPortAdjustTimeout = null;

			// create a unique namespace for events that the widget
			// factory cannot unbind automatically. Use eventNamespace if on
			// jQuery UI 1.9+, and otherwise fallback to a custom string.
			this._namespaceID = this.eventNamespace || ('multiselect' + multiselectID);

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
				.appendTo($(o.appendTo)),

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
				.append('<li class="ui-multiselect-close"><a href="#" class="ui-multiselect-close"><span class="ui-icon ui-icon-circle-close"></span></a></li>')
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

			// bump unique ID
			multiselectID++;
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
			id = el.attr('id') || multiselectID++; // unique ID for the label & option tags

			// build items
			el.find('option').each(function (i) {
				var $this = $(this),
				parent = this.parentNode,
				description = this.innerHTML,
				title = this.title,
				value = this.value,
				inputID = 'ui-multiselect-' + (this.id || id + '-option-' + i),
				isDisabled = this.disabled,
				isSelected = this.selected,
				labelClasses = ['ui-corner-all'],
				liClasses = (isDisabled ? 'ui-multiselect-disabled ' : ' ') + this.className,
				isInOptgroup = false,
				optLabel;

				// is this an optgroup?
				if (parent.tagName.toLowerCase() === 'optgroup') {
					isInOptgroup = true;
					optLabel = parent.getAttribute('label');

					// has this optgroup been added already?
					if ($.inArray(optLabel, optgroups) === -1) {
						if (o.optGroupCollapsible || o.optGroupSelectable) {
							html += '<li class="ui-multiselect-optgroup-label ' + parent.className + '"><label class="ui-corner-all">' + (o.optGroupCollapsible ? '<a href="#" class="ui-multiselect-optgroup-collapse"></a>' : '') + (o.optGroupSelectable ? '<input type="checkbox" class="ui-multiselect-optgroup-checkbox" />' : '') + '<span>' + optLabel + '</span></label></li>';
						}
						else {
							html += '<li class="ui-multiselect-optgroup-label ui-multiselect-optgroup-label-plain ' + parent.className + '"><span>' + optLabel + '</span></li>';
						}
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

				html += '<li class="' + liClasses + (isInOptgroup ? ' ui-multiselect-optgroup-content' : '') + '">';

				// create the label
				html += '<label for="' + inputID + '" title="' + title + '" class="' + labelClasses.join(' ') + '">';
				html += '<input id="' + inputID + '" name="multiselect_' + id + '" type="' + (o.multiple ? "checkbox" : "radio") + '" value="' + value + '" title="' + title + '"';

				// pre-selected?
				if (isSelected) {
					html += ' checked="checked"';
					html += ' aria-selected="true"';
				}

				// disabled?
				if (isDisabled) {
					html += ' disabled="disabled"';
					html += ' aria-disabled="true"';
				}

				// add the title and close everything off
				html += ' /><span>' + description + '</span></label></li>';
			});

			// insert into the DOM
			checkboxContainer.html( html );

			// cache some moar useful elements
			this.labels = menu.find('label');
			this.inputs = this.labels.children('input:not(.ui-multiselect-optgroup-checkbox)');

			// set widths
			this._setButtonWidth();
			this._setMenuWidth();

			// remember default value
			this.button[0].defaultValue = this.update();

			if (o.optGroupCollapsible) {
				checkboxContainer.addClass('ui-multiselect-optgroup-collapsible');
			}

			if (o.optGroupSelectable) {
				checkboxContainer.addClass('ui-multiselect-optgroup-selectable');
			}

			// update the optgroups
			this._updateOptgroup(checkboxContainer.children('li.ui-multiselect-optgroup-label'));

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
					value = $checked.map(function(){ return $(this).next().html(); }).get().join(', ');
				} else {
					value = o.selectedText.replace('#', numChecked).replace('#', $inputs.length);
				}
			}

			this.buttonlabel.html(value);
			return value;
		},

		// this exists as a separate method so that the developer 
		// can easily override it.
		_setButtonValue: function (value) {
			this.buttonlabel.text(value);
		},

		// binds events
		_bindEvents: function () {
			var self = this, button = this.button;

			function clickHandler() {
				self[self._isOpen ? 'close' : 'open']();
				return false;
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
							self.close();
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
			.on('click.multiselect', 'a', function (e) {
				// close link
				if ($(this).hasClass('ui-multiselect-close')) {
					self.close();

					// check all / uncheck all
				} else {
					self[$(this).hasClass('ui-multiselect-all') ? 'checkAll' : 'uncheckAll']();
				}

				e.preventDefault();
			});

			// optgroup label toggle support
			this.menu
			.on('click.multiselect', '.ui-multiselect-optgroup-collapsible:not(.ui-multiselect-optgroup-selectable) li.ui-multiselect-optgroup-label, .ui-multiselect-optgroup-selectable li.ui-multiselect-optgroup-label a.ui-multiselect-optgroup-collapse', function (e) {
				e.preventDefault();

				var $this = $(this).closest('li.ui-multiselect-optgroup-label');
				self._toggleOptgroupCollapse($this.hasClass('ui-multiselect-optgroup-collapsed'), $this);
				$this.find("a.ui-multiselect-optgroup-collapse").focus();
			})
			.on('mouseenter.multiselect', 'label', function (e) {
				// viewPortAdjustTimeout is used to temporarily prevent the mouseenter event while scrolling (to prevent jumping)
				if (!$(this).hasClass('ui-state-disabled') && (e.isTrigger || !self.viewPortAdjustTimeout)) {
					self.labels.removeClass('ui-state-hover');
					$(this).addClass('ui-state-hover').find('input, a').first().focus();
				}
			})
			.on('keydown.multiselect', 'label', function (e) {
				e.preventDefault();

				switch (e.which) {
					case 9: // tab
					case 27: // esc
						self.close();
						break;
					case 38: // up
					case 40: // down
					case 37: // left
					case 39: // right
						self._traverse(e.which, this);
						break;
					case 13: // enter
						$(this).find('a, input').first().trigger('click');
						break;
					case 32: // space bar
						if (e.target.tagName != "INPUT") {
							$($(this).find('a, input').get().reverse()).first().trigger('click');
						}
						break;
				}
			})
			.on('click.multiselect', 'input[type="checkbox"], input[type="radio"]', function (e) {
				if ($(this).is(".ui-multiselect-optgroup-checkbox")) {
					var $this = $(this),
						$inputs = $this.closest('li.ui-multiselect-optgroup-label').nextUntil('li:not(.ui-multiselect-optgroup-content)').find('input:not(:disabled)'),
						nodes = $inputs.get(),
						label = $this.closest('label').text();

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
				}
				else {
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

					// change state on the original option tags
					tags.each(function () {
						if (this.value === val) {
							this.selected = checked;
						} else if (!self.options.multiple) {
							this.selected = false;
						}
					});

					// some additional single select-specific logic
					if (!self.options.multiple) {
						self.labels.removeClass('ui-state-active');
						$this.closest('label').toggleClass('ui-state-active', checked);

						// close menu
						self.close();
					}

					// fire change on the select box
					self.element.trigger("change");

					// update the optgroups
					self._updateOptgroup($this.closest('li.ui-multiselect-optgroup-content').prevAll('li.ui-multiselect-optgroup-label'));

					// setTimeout is to fix multiselect issue #14 and #47. caused by jQuery issue #3827
					// http://bugs.jquery.com/ticket/3827 
					setTimeout($.proxy(self.update, self), 10);
				}
			});

			// close each widget when clicking on any other element/anywhere else on the page
			$doc.bind('mousedown.' + this._namespaceID, function (event) {
				var target = event.target;

				if (self._isOpen
					&& target !== self.button[0]
					&& target !== self.menu[0]
					&& !$.contains(self.menu[0], target)
					&& !$.contains(self.button[0], target)
				  ) {
					self.close();
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
			}

			// set widths
			this.button.outerWidth( width );
		},

		// set menu width
		_setMenuWidth: function () {
			var m = this.menu;
			m.outerWidth( this.button.outerWidth() );
		},

		// move up or down within the menu
		_traverse: function (which, start) {
			var self = this,
			$start = $(start),
			moveToLast = which === 38 || which === 37,
			// select the first li that isn't disabled
			$next = $start.closest('li')[moveToLast ? 'prevAll' : 'nextAll']('li:visible:not(.ui-multiselect-disabled, .ui-multiselect-optgroup-label-plain)').first();

			if ($next.length) {

				$next.find('label').trigger('mouseover');

				var $container = this.menu.find('ul').last();
				
				var selectionBottom = $next.position().top + $next.outerHeight();

				// check for and move down
				if (selectionBottom > $container.innerHeight()) {
					clearTimeout(self.viewPortAdjustTimeout);
					this.viewPortAdjustTimeout = setTimeout(function () { self.viewPortAdjustTimeout = null; }, 500);

					$container.scrollTop($container.scrollTop() + selectionBottom - $container.innerHeight());
				}

				// check for and move up						
				if ($next.position().top < 0) {
					clearTimeout(self.viewPortAdjustTimeout);
					this.viewPortAdjustTimeout = setTimeout(function () { self.viewPortAdjustTimeout = null; }, 500);

					$container.scrollTop($container.scrollTop() + $next.position().top);
				}
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

				if (flag) {
					this.setAttribute('aria-selected', true);
				} else {
					this.removeAttribute('aria-selected');
				}
			};
		},

		_toggleChecked: function (flag, group) {
			var $inputs = (group && group.length) ?  group : this.inputs,
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

			// update the optgroups
			self._updateOptgroup($inputs.closest('li.ui-multiselect-optgroup-content').prevAll('li.ui-multiselect-optgroup-label'));

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

			if(flag) {
				// remember which elements this widget disabled (not pre-disabled)
				// elements, so that they can be restored if the widget is re-enabled.
				inputs = inputs.filter(':enabled')
					.data(key, true)
			} else {
				inputs = inputs.filter(function() {
					return $.data(this, key) === true;
				}).removeData(key);
			}

			inputs
				.attr({ 'disabled':flag, 'arial-disabled':flag })
				.parent()[flag ? 'addClass' : 'removeClass']('ui-state-disabled');

			this.element
			.attr({ 'disabled': flag, 'aria-disabled': flag });
		},

		_updateOptgroup: function ($optgroups) {
			var o = this.options;
			if (o.optGroupSelectable) {
				$optgroups.each(function () {
					var $this = $(this),
					$optgroupInputs = $this.nextUntil('li:not(.ui-multiselect-optgroup-content)').find('input:not(:disabled)'),
					inputCount = $optgroupInputs.length,
					checkedCount = $optgroupInputs.filter(':checked').length
					optGroupInput = $this.find('input');
					
					optGroupInput.prop("checked", checkedCount == inputCount);
					optGroupInput.prop("indeterminate", checkedCount > 0 && checkedCount < inputCount);
				});
			}
		},

		_toggleOptgroupCollapse: function (flag, $optgroups) {
			var o = this.options;

			if (o.optGroupCollapsible) {
				$optgroups.each(function () {
					var $this = $(this),
					$options = $this.nextUntil('li:not(.ui-multiselect-optgroup-content)');

					$options.toggle(flag);
					$this.toggleClass("ui-multiselect-optgroup-collapsed", !flag);
				});
			}
		},

		// open the menu
		open: function (e) {
			var self = this,
				button = this.button,
				menu = this.menu,
				speed = this.speed,
				o = this.options,
				args = [];

			// bail if the multiselectopen event returns false, this widget is disabled, or is already open 
			if (this._trigger('beforeopen') === false || button.hasClass('ui-state-disabled') || this._isOpen) {
				return;
			}

			var $container = menu.find('ul').last(),
			effect = o.show;

			// figure out opening effects/speeds
			if ($.isArray(o.show)) {
				effect = o.show[0];
				speed = o.show[1] || self.speed;
			}

			// if there's an effect, assume jQuery UI is in use
			// build the arguments to pass to show()
			if( effect ) {
				args = [ effect, speed ];
			}

			// positon
			this.position();

			// show the menu, maybe with a speed/effect combo
			$.fn.show.apply(menu, args);

			// set the scroll of the checkbox container
			$container.css('max-height', o.height).scrollTop(0);

			// select the first not disabled option
			// triggering both mouseover and mouseover because 1.4.2+ has a bug where triggering mouseover
			// will actually trigger mouseenter.  the mouseenter trigger is there for when it's eventually fixed
			this.labels.filter(':not(.ui-state-disabled)').eq(0).trigger('mouseover').trigger('mouseenter').find('input').trigger('focus');

			button.addClass('ui-state-active');
			this._isOpen = true;
			this._trigger('open');
		},

		// close the menu
		close: function () {
			if (this._trigger('beforeclose') === false) {
				return;
			}

			var o = this.options,
			    effect = o.hide,
			    speed = this.speed,
			    args = [];

			// figure out opening effects/speeds
			if ($.isArray(o.hide)) {
				effect = o.hide[0];
				speed = o.hide[1] || this.speed;
			}

			if( effect ) {
				args = [ effect, speed ];
			}

	    	$.fn.hide.apply(this.menu, args);
			this.button.removeClass('ui-state-active').trigger('blur').trigger('mouseleave');
			this._isOpen = false;
			this._trigger('close');
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

			// unbind events
			$doc.unbind(this._namespaceID);

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
		
		getButton: function(){
			return this.button;
		},

		position: function () {
			var o = this.options;

			// use the position utility if it exists and options are specifified
			if ($.ui.position && !$.isEmptyObject(o.position)) {
				o.position.of = o.position.of || this.button;

				this.menu
				  .show()
				  .position(o.position)
				  .hide();

				// otherwise fallback to custom positioning
			} else {
				var pos = this.button.offset();

				this.menu.css({
					top: pos.top + this.button.outerHeight(),
					left: pos.left
				});
			}
		},

		collapseOptgroups: function (optgroups) {
			this.toggleOptgroups(false, optgroups);
		},

		expandOptgroups: function (optgroups) {
			this.toggleOptgroups(true, optgroups);
		},

		toggleOptgroups: function (flag, optgroups) {
			var $optgroups;
			if (!optgroups) {
				$optgroups = this.checkboxContainer.find('li.ui-multiselect-optgroup-label');
			}
			else if ($.isArray(optgroups)) {
				$optgroups = $([]);
				for (var i = 0, length = optgroups.length; i < length; i++) {
					$optgroups = $optgroups.add(this.checkboxContainer.find("li.ui-multiselect-optgroup-label span:contains(" + optgroups[i] + ")").closest('li.ui-multiselect-optgroup-label'));
				}
			}
			this._toggleOptgroupCollapse(flag, $optgroups);
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
					break;
				case 'position':
					this.position();
					break;
				case 'optGroupCollapsible':
					checkboxContainer.toggleClass('ui-multiselect-optgroup-collapsible', value);
					break;
				case 'optGroupSelectable':
					checkboxContainer.toggleClass('ui-multiselect-optgroup-selectable', value);
					break;
			}

			$.Widget.prototype._setOption.apply(this, arguments);
		}
	});

})(jQuery);
