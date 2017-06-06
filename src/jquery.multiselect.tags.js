/*
 * jQuery MultiSelect UI Widget Tag Plugin 0.1
 * Copyright (c) 2011 John Roepke
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
	$.widget("ech.multiselecttags", {
		_create: function() {
			var self = this,
				instance = (this.instance = $(this.element).data("multiselect")),
				labels = (this.labels = instance.labels);


			// Add a container after the button for holding selected elements
			var selectedElements = (this.selectedElements = $('<ul />'))
				.addClass('ui-multiselect-tags ui-helper-reset ui-helper-clearfix')
				.insertAfter( instance.button );
		
			// Catch click events on the "x" remove links
			this.selectedElements.delegate('a', 'click.multiselect', function(e){
				e.preventDefault();
				var $this = $(this),
					val = $this.attr("value"),
					$inputs = labels.find('input'),
					checked = $inputs.filter(':checked'),
					tags = instance.element.find('option');
					
				
				// Set the option tag to deselected
				tags.each(function(){
					if( this.value === val ){
						this.selected = false;
					}
				});
				// Set the checkbox to deselected
				checked.each(function(){
					if( this.value === val ){
						this.checked = false;
					}
				});
				// Remove tag
				$this.parent().remove();

				// Trigger an update of the multiselect widget
				setTimeout($.proxy(instance.update, instance), 10);
			});

			// Bind to changes to the select element and update tags.
			$(instance.element[0]).bind("change", function() {
				self.updateTags();
			});
			
                        
                        // Load initially selected tags
                        self.updateTags();
		},

		updateTags: function() {
			var $inputs = this.labels.find('input'),
			    $checked = $inputs.filter(':checked');

			// Rewrite the tags
			this.selectedElements.html($checked.map(function(){
				return '<li class="ui-corner-all ui-widget-content ui-state-default">'
					+ this.title
					+ '&nbsp;<a href="#" class="ui-corner-br ui-corner-tr ui-widget-header" value="'
					+ this.value
					+ '">x</a></li>';
			}).get().join(''));
		},

		widget: function() {
			return this.selectedElements;
		},

		destroy: function() {
			$.Widget.prototype.destroy.call( this );
			this.selectedElements.remove();
		}
	});
})(jQuery);

