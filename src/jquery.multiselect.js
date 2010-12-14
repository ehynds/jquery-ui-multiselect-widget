/*
 * jQuery MultiSelect UI Widget 1.7.1pre
 * Copyright (c) 2010 Eric Hynds
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
(function($, undefined){

var multiselectID = 0;

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
		show: '',
		hide: '',
		autoOpen: false,
		multiple: true,
		position: {}
	},

	_create: function(){
		var el = this.element.hide(),
			o = this.options,
			optgroups = [],
			id = el.attr('id') || multiselectID++; // unique ID for the label & option tags

		this.speed = $.fx.speeds._default; // default speed for effects
		this._isOpen = false; // assume no

		var
			button = (this.button = $('<button type="button"><span class="ui-icon ui-icon-triangle-2-n-s"></span></button>'))
				.addClass('ui-multiselect ui-widget ui-state-default ui-corner-all')
				.addClass( o.classes )
				.attr({ 'title':el.attr('title'), 'aria-haspopup':true })
				.insertAfter( el ),

			buttonlabel = (this.buttonlabel = $('<span></span>'))
				.html( o.noneSelectedText )
				.appendTo( button ),

			menu = (this.menu = $('<div />'))
				.addClass('ui-multiselect-menu ui-widget ui-widget-content ui-corner-all')
				.addClass( o.classes )
				.insertAfter( button ),

			header = (this.header = $('<div />'))
				.addClass('ui-widget-header ui-corner-all ui-multiselect-header ui-helper-clearfix')
				.appendTo( menu ),

			headerLinkContainer = $('<ul />')
				.addClass('ui-helper-reset')
				.html(function(){
					if( o.header === true ){
						return '<li><a class="ui-multiselect-all" href="#"><span class="ui-icon ui-icon-check"></span><span>' + o.checkAllText + '</span></a></li><li><a class="ui-multiselect-none" href="#"><span class="ui-icon ui-icon-closethick"></span><span>' + o.uncheckAllText + '</span></a></li>';
					} else if(typeof o.header === "string"){
						return '<li>' + o.header + '</li>';
					} else {
						return '';
					}
				})
				.append('<li class="ui-multiselect-close"><a href="#" class="ui-multiselect-close"><span class="ui-icon ui-icon-circle-close"></span></a></li>')
				.appendTo( header ),

			checkboxContainer = (this.checkboxContainer = $('<ul />'))
				.addClass('ui-multiselect-checkboxes ui-helper-reset')
				.appendTo( menu );

		// build items
		el.find('option').each(function(i){
			var $this = $(this),
				title = $this.html(),
				value = this.value,
				inputID = this.id || 'ui-multiselect-'+id+'-option-'+i,
				$parent = $this.parent(),
				isDisabled = $this.is(':disabled'),
				labelClasses = ['ui-corner-all'],
				label, input, checkbox, li;

			// is this an optgroup?
			if( $parent.is('optgroup') ){
				var optLabel = $parent.attr('label');

				// has this optgroup been added already?
				if( $.inArray(optLabel, optgroups) === -1 ){
					$('<li><a href="#">' + optLabel + '</a></li>')
						.addClass('ui-multiselect-optgroup-label')
						.appendTo( checkboxContainer );

					optgroups.push( optLabel );
				}
			}

			if( value.length > 0 ){
				if( isDisabled ){
					labelClasses.push('ui-state-disabled');
				}

				li = $('<li />')
					.addClass(isDisabled ? 'ui-multiselect-disabled' : '')
					.appendTo( checkboxContainer );

				label = $('<label />')
					.attr('for', inputID)
					.addClass(labelClasses.join(' '))
					.appendTo( li );

				// attr's are inlined to support form reset
				checkbox = $('<input type="'+(o.multiple ? 'checkbox' : 'radio')+'" '+($this.is(':selected') ? 'checked="checked"' : '')+ '" name="multiselect_'+id + '" />')
					.attr({ id:inputID, title:title, disabled:isDisabled, 'aria-disabled':isDisabled })
					.val( value )
					.appendTo( label )
					.after('<span>'+title+'</span>');
			}
		});

		// cache some moar useful elements
		this.labels = menu.find('label');
		if( !o.multiple ){
			this.radios = menu.find(':radio');
		}

		// set widths
		this._setButtonWidth();
		this._setMenuWidth();

		// perform event bindings
		this._bindEvents();

		// remember default value
		button[0].defaultValue = this.update();
	},

	_init: function(){
		if( this.options.header === false || this.options.multiple === false ){
			this.header.hide();
		}
		if( this.options.autoOpen ){
			this.open();
		}
		if( this.element.is(':disabled') ){
			this.disable();
		}
	},

	// binds events
	_bindEvents: function(){
		var self = this, button = this.button;

		function clickHandler(){
			self[ self._isOpen ? 'close' : 'open' ]();
			return false;
		}

		// webkit doesn't like it when you click on the span :(
		button.find('span').bind('click.multiselect', clickHandler);

		// button events
		button.bind({
			click: clickHandler,
			keypress: function(e){
				switch(e.which){
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
			mouseenter: function(){
				if( !button.hasClass('ui-state-disabled') ){
					$(this).addClass('ui-state-hover');
				}
			},
			mouseleave: function(){
				$(this).removeClass('ui-state-hover');
			},
			focus: function(){
				if( !button.hasClass('ui-state-disabled') ){
					$(this).addClass('ui-state-focus');
				}
			},
			blur: function(){
				$(this).removeClass('ui-state-focus');
			}
		});

		// header links
		this.header
			.delegate('a', 'click.multiselect', function(e){
				// close link
				if( $(this).hasClass('ui-multiselect-close') ){
					self.close();

				// check all / uncheck all
				} else {
					self[ $(this).hasClass('ui-multiselect-all') ? 'checkAll' : 'uncheckAll' ]();
				}

				e.preventDefault();
			});

		// optgroup label toggle support
		this.menu
			.delegate('li.ui-multiselect-optgroup-label a', 'click.multiselect', function(e){
				var $this = $(this),
					$inputs = $this.parent().nextUntil('li.ui-multiselect-optgroup-label').find('input:visible:not(:disabled)');

				// toggle inputs
				self._toggleChecked( $inputs.filter(':checked').length !== $inputs.length, $inputs );

				// trigger event
				self._trigger('optgrouptoggle', e, {
					inputs: $inputs.get(),
					label: $this.parent().text(),
					checked: $inputs[0].checked
				});

				e.preventDefault();
			})
			.delegate('label', 'mouseenter', function(){
				if( !$(this).hasClass('ui-state-disabled') ){
					self.labels.removeClass('ui-state-hover');
					$(this).addClass('ui-state-hover').find('input').focus();
				}
			})
			.delegate('label', 'keydown', function(e){
				switch(e.which){
					case 9: // tab
					case 27: // esc
						self.close();
						break;
					case 38: // up
					case 40: // down
					case 37: // left
					case 39: // right
						self._traverse(e.which, this);
						e.preventDefault();
						break;
					case 13: // enter
						e.preventDefault();
						$(this).find('input').trigger('click');
						break;
				}
			})
			.delegate(':checkbox, :radio', 'click', function(e){
				var $this = $(this),
					val = this.value,
					checked = this.checked,
					tags = self.element.find('option');

				// bail if this input is disabled or the event is cancelled
				if( $this.is(':disabled') || self._trigger('click', e, { value:val, text:this.title, checked:checked }) === false ){
					e.preventDefault();
					return;
				}

				// make sure the original option tags are unselected first
				// in a single select
				if( !self.options.multiple ){
					tags.not(function(){
						return this.value === val;
					}).removeAttr('selected');
				}

				// toggle aria state
				$this.attr('aria-selected', checked);

				// set the original option tag to selected
				tags.filter(function(){
					return this.value === val;
				}).attr('selected', (checked ? 'selected' : ''));
				// issue 14: if this event is natively fired, the box will be checked
				// before running the update.  using trigger(), the events fire BEFORE
				// the box is checked. http://dev.jquery.com/ticket/3827
				self.update( !e.originalEvent ? checked ? -1 : 1 : 0 );
				// setTimeout is to fix multiselect issue #14 and #47. caused by jQuery issue #3827
				// http://bugs.jquery.com/ticket/3827 
				setTimeout($.proxy(self.update, self), 10);
			});

		// close each widget when clicking on any other element/anywhere else on the page
		$(document).bind('click.multiselect', function(e){
			var $target = $(e.target);

			if(self._isOpen && !$.contains(self.menu[0], e.target) && !$target.is('button.ui-multiselect')){
				self.close();
			}
		});

		// deal with form resets.  the problem here is that buttons aren't
		// restored to their defaultValue prop on form reset, and the reset
		// handler fires before the form is actually reset.  delaying it a bit
		// gives the form inputs time to clear.
		$(this.element[0].form).bind('reset', function(){
			setTimeout(function(){ self.update(); }, 10);
		});
	},

	// set button width
	_setButtonWidth: function(){
		var width = this.element.outerWidth(),
			o = this.options;

		if( /\d/.test(o.minWidth) && width < o.minWidth){
			width = o.minWidth;
		}

		// set widths
		this.button.width( width );
	},

	// set menu width
	_setMenuWidth: function(){
		var m = this.menu,
			width = this.button.outerWidth()-
				parseInt(m.css('padding-left'),10)-
				parseInt(m.css('padding-right'),10)-
				parseInt(m.css('border-right-width'),10)-
				parseInt(m.css('border-left-width'),10);

		m.width( width || this.button.outerWidth() );
	},

	// move up or down within the menu
	_traverse: function(which, start){
		var $start = $(start),
			moveToLast = which === 38 || which === 37,

			// select the first li that isn't an optgroup label / disabled
			$next = $start.parent()[moveToLast ? 'prevAll' : 'nextAll']('li:not(.ui-multiselect-disabled, .ui-multiselect-optgroup-label)')[ moveToLast ? 'last' : 'first']();

		// if at the first/last element
		if( !$next.length ){
			var $container = this.menu.find('ul:last');

			// move to the first/last
			this.menu.find('label')[ moveToLast ? 'last' : 'first' ]().trigger('mouseover');

			// set scroll position
			$container.scrollTop( moveToLast ? $container.height() : 0 );

		} else {
			$next.find('label').trigger('mouseover');
		}
	},

	_toggleChecked: function(flag, group){
		var $inputs = (group && group.length) ?
			group :
			this.labels.find('input');

		// toggle state on inputs
		$inputs
			.not(':disabled')
			.attr({ 'checked':flag, 'aria-selected':flag });

		this.update();

		var values = $inputs.map(function(){
			return this.value;
		}).get();

		// toggle state on original option tags
		this.element.find('option').filter(function(){
			return !this.disabled && $.inArray(this.value, values) > -1;
		}).attr({ 'selected':flag, 'aria-selected':flag });
	},

	_toggleDisabled: function( flag ){
		this.button
			.attr({ 'disabled':flag, 'aria-disabled':flag })[ flag ? 'addClass' : 'removeClass' ]('ui-state-disabled');

		this.menu
			.find('input')
			.attr({ 'disabled':flag, 'aria-disabled':flag })
			.parent()[ flag ? 'addClass' : 'removeClass' ]('ui-state-disabled');

		this.element
			.attr({ 'disabled':flag, 'aria-disabled':flag });
	},

	// updates the number of selected items in the button
	update: function( offset ){
		if( offset === undefined ){
			offset = 0;
		}
		var o = this.options,
			$inputs = this.labels.find('input'),
			$checked = $inputs.filter(':checked'),
			numChecked = $checked.length,
			value;

		if( numChecked === 0 ){
			value = o.noneSelectedText;
		} else {
			if($.isFunction(o.selectedText)){
				value = o.selectedText.call(this, numChecked, $inputs.length, $checked.get());
			} else if( /\d/.test(o.selectedList) && o.selectedList > 0 && numChecked <= o.selectedList){
				value = $checked.map(function(){ return this.title; }).get().join(', ');
			} else {
				value = o.selectedText.replace('#', numChecked).replace('#', $inputs.length);
			}
		}

		this.buttonlabel.html( value );
		return value;
	},

	// open the menu
	open: function(e){
		var self = this,
			button = this.button,
			menu = this.menu,
			speed = this.speed,
			o = this.options;

		// bail if the multiselectopen event returns false, this widget is disabled, or is already open
		if( this._trigger('beforeopen') === false || button.hasClass('ui-state-disabled') || this._isOpen ){
			return;
		}

		// close other instances
		$(':ech-multiselect').not(this.element).each(function(){
			var $this = $(this);

			if( $this.multiselect('isOpen') ){
				$this.multiselect('close');
			}
		});

		var $container = menu.find('ul:last'),
			effect = o.show,
			pos = button.position();

		// figure out opening effects/speeds
		if( $.isArray(o.show) ){
			effect = o.show[0];
			speed = o.show[1] || self.speed;
		}

		// set the scroll of the checkbox container
		$container.scrollTop(0).height(o.height);

		// position and show menu
		if( $.ui.position && !$.isEmptyObject(o.position) ){
			o.position.of = o.position.of || button;

			menu
				.show()
				.position( o.position )
				.hide()
				.show( effect, speed );

		// if position utility is not available...
		} else {
			menu.css({
				top: pos.top+button.outerHeight(),
				left: pos.left
			}).show( effect, speed );
		}

		// select the first option
		// triggering both mouseover and mouseover because 1.4.2+ has a bug where triggering mouseover
		// will actually trigger mouseenter.  the mouseenter trigger is there for when it's eventually fixed
		this.labels.eq(0).trigger('mouseover').trigger('mouseenter').find('input').trigger('focus');

		button.addClass('ui-state-active');
		this._isOpen = true;
		this._trigger('open');
	},

	// close the menu
	close: function(){
		if(this._trigger('beforeclose') === false){
			return;
		}

		var o = this.options, effect = o.hide, speed = this.speed;

		// figure out opening effects/speeds
		if( $.isArray(o.hide) ){
			effect = o.hide[0];
			speed = o.hide[1] || this.speed;
		}

		this.menu.hide(effect, speed);
		this.button.removeClass('ui-state-active').trigger('blur').trigger('mouseleave');
		this._trigger('close');
		this._isOpen = false;
	},

	enable: function(){
		this._toggleDisabled(false);
	},

	disable: function(){
		this._toggleDisabled(true);
	},

	checkAll: function(e){
		this._toggleChecked(true);
		this._trigger('checkAll');
	},

	uncheckAll: function(){
		this._toggleChecked(false);
		this._trigger('uncheckAll');
	},

	getChecked: function(){
		return this.menu.find('input').filter(':checked');
	},

	setChecked: function(options){
	    if(!$.isArray(options)) {
	        var arr = new Array(options);
	    } else {
	        var arr = options.slice();
	    }
	    this._toggleChecked(false);
	    $.each(this.menu.find('input'),function(i,item) {
	        if(arr.length === 0) {
	            return false;
	        }
	        var idx = $.inArray($(item).val(),arr);
	        if(idx !== -1) {
                $(item).attr("checked",true);
                arr.splice(idx,1);
	        }
	    });
	    this.update();
	},

	destroy: function(){
		// remove classes + data
		$.Widget.prototype.destroy.call( this );

		this.button.remove();
		this.menu.remove();
		this.element.show();

		return this;
	},

	isOpen: function(){
		return this._isOpen;
	},

	widget: function(){
		return this.menu;
	},

	// react to option changes after initialization
	_setOption: function( key, value ){
		var menu = this.menu;

		switch(key){
			case 'header':
				menu.find('div.ui-multiselect-header')[ value ? 'show' : 'hide' ]();
				break;
			case 'checkAllText':
				menu.find('a.ui-multiselect-all span').eq(-1).text(value);
				break;
			case 'uncheckAllText':
				menu.find('a.ui-multiselect-none span').eq(-1).text(value);
				break;
			case 'height':
				menu.find('ul:last').height( parseInt(value,10) );
				break;
			case 'minWidth':
				this.options[ key ] = parseInt(value,10);
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
		}

		$.Widget.prototype._setOption.apply( this, arguments );
	}
});

})(jQuery);

