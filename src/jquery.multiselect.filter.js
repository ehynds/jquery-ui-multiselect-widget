/* jshint forin:true, noarg:true, noempty:true, eqeqeq:true, boss:true, undef:true, curly:true, browser:true, jquery:true */
/*
 * jQuery MultiSelect UI Widget Filtering Plugin 3.0.0
 * Copyright (c) 2012 Eric Hynds
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
(function($) {
  var rEscape = /[\-\[\]{}()*+?.,\\\^$|#\s]/g;

  //Courtesy of underscore.js
  function debounce(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) {
          func.apply(context, args);
        }
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) {
        func.apply(context, args);
      }
    };
  }

  $.widget('ech.multiselectfilter', {

    options: {
      label: 'Filter:',
      width: null, /* override default width set in css file (px). null will inherit */
      placeholder: 'Enter keywords',
      autoReset: false,
      debounceMS: 250
    },

    _create: function() {
      var opts = this.options;
      var $element = this.element;

      // get the multiselect instance
      this.instance = $element.multiselect('instance');

      // store header; add filter class so the close/check all/uncheck all links can be positioned correctly
      this.$header = this.instance.$menu.find('.ui-multiselect-header').addClass('ui-multiselect-hasfilter');

      // wrapper $element
      this.$input = $(document.createElement('input'))
        .attr({
          placeholder: opts.placeholder,
          type: "search"
        })
        .css({  width: (/\d/.test(opts.width) ? opts.width + 'px' : null) })
        .on({
        keydown: function(e) {
          // prevent the enter key from submitting the form / closing the widget
          if(e.which === 13)
            e.preventDefault();
          else if(e.which === 27) {
            $element.multiselect('close');
            e.preventDefault();
          } 
          else if(e.which === 9 && e.shiftKey) {
            $element.multiselect('close');
            e.preventDefault();
          } 
          else if(e.altKey) {
            switch(e.which) {
              case 82:
                e.preventDefault();
                $(this).val('').trigger('input', '');
                break;
              case 65:
                $element.multiselect('checkAll');
                break;
              case 85:
                $element.multiselect('uncheckAll');
                break;
              case 76:
                $element.multiselect('instance').$labels.first().trigger("mouseenter");
                break;
            }
          }
        },
        input: $.proxy(debounce(this._handler, opts.debounceMS), this),
        search: $.proxy(this._handler, this)
      });
      // automatically reset the widget on close?
      if (this.options.autoReset)
        $element.on('multiselectclose', $.proxy(this._reset, this));
     
      // rebuild cache when multiselect is updated
      $element.on('multiselectrefresh', $.proxy(function() {
        this.updateCache();
        this._handler();
      }, this));
      this.$wrapper = $(document.createElement('div'))
                                 .addClass(' ui-multiselect-filter')
                                 .text(opts.label)
                                 .append(this.$input)
                                 .prependTo(this.$header);

      // reference to the actual inputs
      this.$inputs = this.instance.$menu.find('input[type="checkbox"], input[type="radio"]');

      // cache input values for searching
      this.updateCache();

      // rewrite internal _toggleChecked fn so that when checkAll/uncheckAll is fired,
      // only the currently filtered $elements are checked
      this.instance._toggleChecked = function(flag, group) {
        var self = this;
        var $element = this.element;
        var $inputs = (group && group.length) ?  group : this.$inputs;

        // do not include hidden elems if the menu isn't open.
        var selector = self._isOpen ?  ':disabled, :hidden' : ':disabled';

        $inputs = $inputs
          .not(selector)
          .each(this._toggleState('checked', flag));

        // update text
        this.update();

        // gather an array of the values that actually changed
        var values = {};
        for (var inputCount = $inputs.length, x = 0; x < inputCount; x++) {
          values[ $inputs.get(x).value ] = true;
        }

        // select option tags
        $element.find('option').filter(function() {
          if(!this.disabled && values[this.value]) {
            self._toggleState('selected', flag).call(this);
          }
        });

        // trigger the change event on the select
        if(inputCount)
          $element.trigger('change');
        
      };
    },

    // thx for the logic here ben alman
    _handler: function(e) {
      var term = $.trim(this.$input[0].value.toLowerCase()),

      // speed up lookups
      $rows = this.$rows, $inputs = this.$inputs, $cache = this.$cache;
      var $groups = this.instance.$menu.find(".ui-multiselect-optgroup");
      $groups.show();
      $rows.toggle(!term);
      if(term) {
        var regex = new RegExp(term.replace(rEscape, "\\$&"), 'gi');

        this._trigger("filter", e, $.map($cache, function(v, i) {
          if(v.search(regex) !== -1) {
            $rows.eq(i).show();
            return $inputs.get(i);
          }

          return null;
        }));
      }

      // show/hide optgroups
      $groups.each(function() {
        var $this = $(this);
        if (!$this.children('li').filter(':visible').length)
          $this.hide();
      });
      this.instance._setMenuHeight();
    },

    _reset: function() {
      this.$input.val('').trigger('input', '');
    },

    updateCache: function() {
      // each list item
      this.$rows = this.instance.$labels.parent();

      // cache
      this.$cache = this.element.children().map(function() {
        var $element = $(this);

        // account for optgroups
        if(this.tagName.toLowerCase() === "optgroup") {
          $element = $element.children();
        }

        return $element.map(function() {
          return this.innerHTML.toLowerCase();
        }).get();
      }).get();
    },

    widget: function() {
      return this.$wrapper;
    },

    destroy: function() {
      $.Widget.prototype.destroy.call(this);
      this.$input.val('').trigger("keyup");
      this.$wrapper.remove();
    }
  });

})(jQuery);
