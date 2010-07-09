// filtering plugin for the multiselect widget

(function($){

	$.widget("ech.multiselectfilter", {
		_create: function(){
			var instance = $(this.element).data("multiselect"),
				
				header = instance.menu.find(".ui-multiselect-header"),
			
				// build the input box
				input = header
					.prepend('<div style="float:left; margin-right:10px">Filter: <input type="text" name="keyword" style="width:100px; font-size:11px"></div>')
					.find("input")
					.keyup( filter ),
		
				// each list item
				rows = instance.menu.find(".ui-multiselect-checkboxes li"),
			
				// array of the option tag values
				cache = instance.optiontags.map(function(){
					return this.innerHTML.toLowerCase();
				});
		
			// adjust the positioning of the check all/none links
			header.find("ul").css({ position:"relative", top:"3px" });
			
			// rewrite internal _toggleChecked fn so that when checkAll is fired,
			// only the currently filtered elements are checked
			instance._toggleChecked = function(flag, group){
				var $inputs = (group && group.length) 
					? group
					: this.labels.find('input');
				
				$inputs.not(':disabled, :hidden').attr('checked', (flag ? 'checked' : '')); 
				this.update();
				this.optiontags.not('disabled').attr('selected', (flag ? 'selected' : ''));
			};
			
			// filtering logic by john resig, ejohn.org.  http://ejohn.org/blog/jquery-livesearch/
			function filter(){
				var term = $.trim( this.value.toLowerCase() ), matches = [];
			
				if( !term ){
					rows.show();
				} else {
					rows.hide();
				
					cache.each(function(i,v){
						if( v.indexOf(term) !== -1 ){
							matches.push( i );
						}
					});
				
					$.each(matches, function(i,v){
						rows.eq(v).show();
					});
				}
			}
		}
	});
})(jQuery);
