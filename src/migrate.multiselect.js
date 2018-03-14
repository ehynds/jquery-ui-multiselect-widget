// Load this JavaScript file *after* the main jquery.multiselect.js file.

/**
* Converts Version 2 style jQuery UI multiselect options to Version 3.
*/

$.ech.multiselect.prototype._migrateOptions = function() {
   var options = this.options;

   // Renamed options
   var renamed =  { 'height' : 'menuHeight', 'hide' : 'closeEffect', 'minWidth' : 'buttonWidth', 'show' : 'openEffect' };
   for (name in renamed) {
      if (name in options) {
         options[ renamed[ name ] ] = options[ name ];
      }
   }

   // New option usage
   if ('multiple' in options) {
      this.element[0].multiple == !!options.multiple ? 'multiple' : '';
   }
   if ('showCheckAll' in options || 'showUncheckAll' in options) {
      options.header = ( !!options.showCheckAll ? ['checkAll'] : [] ).concat( !!options.showUncheckAll ? ['uncheckAll'] : [] );
   }
   if ('checkAllText' in options || 'uncheckAllText' in options || 'closeIcon' in options) {
      options.linkInfo = $.extend( {},
                                       !!options.checkAllText ? {'checkAll' : {'text' : options.checkAllText} } : {},
                                       !!options.uncheckAllText ? {'uncheckAll' : {'text' : options.uncheckAllText} } : {},
                                       !!options.closeIcon ? {'close' : {'icon' : options.closeIcon} } : {},
                                       options.linkInfo || {}
                                    );
   }
};
