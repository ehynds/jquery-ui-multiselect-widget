/* jshint forin:true, noarg:true, noempty:true, eqeqeq:true, boss:true, undef:true, curly:true, browser:true, jquery:true */
/*
 * jQuery MultiSelect UI Widget Filtering Plugin 1.6pre
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
      debounceMS: 250,
      optGroupSearchable:false,
      onlyOptGroupSearchable:false
    },

    _create: function() {
      var opts = this.options;
      var elem = $(this.element);

      // get the multiselect instance
      var instance = (this.instance = (elem.data('echMultiselect') || elem.data("multiselect") || elem.data("ech-multiselect")));

      // store header; add filter class so the close/check all/uncheck all links can be positioned correctly
      var header = (this.header = instance.menu.find('.ui-multiselect-header').addClass('ui-multiselect-hasfilter'));

      // wrapper elem
      var wrapper = (this.wrapper = $('<div class="ui-multiselect-filter">' + (opts.label.length ? opts.label : '') + '<input placeholder="'+opts.placeholder+'" type="search"' + (/\d/.test(opts.width) ? 'style="width:'+opts.width+'px"' : '') + ' /></div>').prependTo(this.header));

      // reference to the actual inputs
      this.inputs = instance.menu.find('input[type="checkbox"], input[type="radio"]');

      // build the input box
      this.input = wrapper.find('input').bind({
        keydown: function(e) {
          // prevent the enter key from submitting the form / closing the widget
          if(e.which === 13) {
            e.preventDefault();
          }
        },
        input: $.proxy(debounce(this._handler, opts.debounceMS), this),
        search: $.proxy(this._handler, this)
      });

      // cache input values for searching
      this.updateCache();

      // rewrite internal _toggleChecked fn so that when checkAll/uncheckAll is fired,
      // only the currently filtered elements are checked
      instance._toggleChecked = function(flag, group) {
        var $inputs = (group && group.length) ?  group : this.labels.find('input');
        var _self = this;

        // do not include hidden elems if the menu isn't open.
        var selector = _self._isOpen ?  ':disabled, :hidden' : ':disabled';

        $inputs = $inputs
          .not(selector)
          .each(this._toggleState('checked', flag));

        // update text
        this.update();

        // gather an array of the values that actually changed
        var values = {};
        $inputs.each(function() {
          values[this.value] = true;
        });

        // select option tags
        this.element.find('option').filter(function() {
          if(!this.disabled && values[this.value]) {
            _self._toggleState('selected', flag).call(this);
          }
        });

        // trigger the change event on the select
        if($inputs.length) {
          this.element.trigger('change');
        }
      };

      // rebuild cache when multiselect is updated
      var doc = $(document).bind('multiselectrefresh.'+ instance._namespaceID, $.proxy(function() {
        this.updateCache();
        this._handler();
      }, this));

      // automatically reset the widget on close?
      if(this.options.autoReset) {
        doc.bind('multiselectclose.'+ instance._namespaceID, $.proxy(this._reset, this));
      }
    },

    // thx for the logic here ben alman
    _handler: function(e) {
      var term = $.trim(this.input[0].value.toLowerCase()),

      // speed up lookups
      rows = this.rows, inputs = this.inputs, cache = this.cache, options = this.options;

      if(!term) {
        rows.show();
        rows.removeClass("multiselect-options-hide-away");
        rows.filter(".a-multiselect-expandcollpase-optgroup").attr("alt","+").addClass('multiselect-optgroup-plus').removeClass('multiselect-optgroup-minus');
      } else {
        rows.hide();

        var regex = new RegExp(term.replace(rEscape, "\\$&"), 'gi');

        this._trigger("filter", e, $.map(cache, function(v, i) {
          if(v.search(regex) !== -1) {
            rows.eq(i).show();
            rows.eq(i).removeClass("multiselect-options-hide-away");
            return inputs.get(i);
          }
          return null;
        }));
      }

      // show/hide optgroups
      this.instance.menu.find(".ui-multiselect-optgroup-label").each(function() {
        var $this = $(this);
        $this.find(".a-multiselect-expandcollpase-optgroup").attr("alt",'-').addClass('multiselect-optgroup-minus').removeClass('multiselect-optgroup-plus');
        var isVisible = $this.nextUntil('.ui-multiselect-optgroup-label').filter(function() {
          return $.css(this, "display") !== 'none';
        }).length;

        var parentVisible = $this.filter(function(){return $.css(this,"display")!='none';}).length;
        if(parentVisible>0 && isVisible ==0 && (options.optGroupSearchable || options.onlyOptGroupSearchable))
        {
            $this.nextUntil('.ui-multiselect-optgroup-label').each(function() {
                $(this).show();
            });
        }
        else
        $this[isVisible ? 'show' : 'hide']();
      });
    },

    _reset: function() {
      this.input.val('').trigger('keyup');
    },

    updateCache: function() {
      // each list item
      var options = this.options;
      if(options.optGroupSearchable || options.onlyOptGroupSearchable)
        this.rows = this.instance.menu.find(".ui-multiselect-checkboxes li");//:not(.ui-multiselect-optgroup-label)");
      else
        this.rows = this.instance.menu.find(".ui-multiselect-checkboxes li:not(.ui-multiselect-optgroup-label)");

      // cache
      this.cache = this.element.children().map(function() {
        var elem = $(this);

        // account for optgroups
        //included self to get optgroup
        if(this.tagName.toLowerCase() === "optgroup") {
            if(options.optGroupSearchable || options.onlyOptGroupSearchable)
                elem = elem.children().andSelf();
            else
                elem = elem.children();
        }

        //Added optgroup  
        return elem.map(function() {
            if(options.onlyOptGroupSearchable)
                return this.localName=="optgroup"?$(this).attr("label").toLowerCase():"";
            else
                return this.localName == "optgroup"? $(this).attr("label").toLowerCase(): this.innerHTML.toLowerCase();
        }).get();
      }).get();
        
        console.log(this.cache);
    },

    widget: function() {
      return this.wrapper;
    },

    destroy: function() {
      $.Widget.prototype.destroy.call(this);
      this.input.val('').trigger("keyup");
      this.wrapper.remove();
    }
  });

})(jQuery);
