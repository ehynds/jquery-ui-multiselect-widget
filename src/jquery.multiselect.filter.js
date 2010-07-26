/*
 * jQuery MultiSelect UI Widget Filtering Plugin
 * Copyright (c) 2010 Eric Hynds
 *
 * http://www.erichynds.com/jquery/jquery-ui-multiselect-widget/
 *
 * Depends:
 *   - jQuery UI MultiSelect widget
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
*/
(function($){
	$.widget("ech.multiselectfilter", {
		options: {
			label: "Filter:",
			width: null, /* override default width set in css file (px). null will inherit */
			placeholder: "Enter keywords"
		},
		
		_create: function(){
			var self = this,
				instance = $(this.element).data("multiselect"),
				inputs = instance.menu.find(":checkbox, :radio"),
				header = instance.menu.find(".ui-multiselect-header"),
				opts = this.options,
				
				// are we dealing w/ optgroups here?
				isOptgroup = instance.optiontags[0].tagName === "OPTGROUP",
				
				// gather all the option tags.  there could be optgroups..
				opttags = isOptgroup ? instance.optiontags.children() : instance.optiontags,
				
				// wrapping container
				wrapper = (self.wrapper = $('<div class="ui-multiselect-filter">'+(opts.label.length ? opts.label : '')+'<input placeholder="'+opts.placeholder+'" type="text"' + (/\d/.test(opts.width) ? 'style="width:'+opts.width+'px"' : '') + ' /></div>').prependTo( header )),
				
				// build the input box
				input = (self.input = wrapper
					.find("input")
					.bind("keydown", function( e ){
						// prevent the enter key from submitting the form / closing the widget
						if( e.keyCode === 13 ){
							return false;
						}
					})
					.bind("keyup", filter )),
				
				// each list item
				rows = instance.menu.find(".ui-multiselect-checkboxes li:not(.ui-multiselect-optgroup-label)"),
			
				// array of the option tag values
				cache = instance.optiontags.map(function(){
					var self = $(this), nodes = self;
					
					// account for optgroups
					if( isOptgroup ){
						nodes = self.children();
					}
					
					return nodes.map(function(){
						return this.innerHTML.toLowerCase();	
					}).get();
				}).get();
			
			// so the close/check all/uncheck all links can be positioned correctly
			header.addClass("ui-multiselect-hasfilter");
			
			// rewrite internal _toggleChecked fn so that when checkAll/uncheckAll is fired,
			// only the currently filtered elements are checked
			instance._toggleChecked = function(flag, group){
				var $inputs = (group && group.length) 
					? group
					: this.labels.find('input');

				$inputs.not(':disabled, :hidden').attr('checked', (flag ? 'checked' : '')); 
				this.update();
				this.optiontags.not('disabled').attr('selected', (flag ? 'selected' : ''));
			};
			
			// thx for the logic ben alman
			function filter( e ){
				var term = $.trim( this.value.toLowerCase() );
			
				if( !term ){
					rows.show();
				} else {
					rows.hide();
			
					self._trigger( "filter", e, $.map(cache, function(v,i){
						if ( v.indexOf(term) !== -1 ){
							rows.eq(i).show();
							return inputs.get(i);
						}
						
						return null;
					}));
				}
			}
		},
		
		destroy: function(){
			$.Widget.prototype.destroy.call( this );
			this.input.val('').trigger("keyup");
			this.wrapper.remove();			
		}
	});
})(jQuery);
