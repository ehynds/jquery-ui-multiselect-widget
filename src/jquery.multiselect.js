/* jshint forin:true, noarg:true, noempty:true, eqeqeq:true, boss:true, undef:true, curly:true, browser:true, jquery:true */
/*
 * jQuery MultiSelect UI Widget 3.0.0
 * Copyright (c) 2012 Eric Hynds
 *
 * Depends:
 *   - jQuery 1.8+                          (http://api.jquery.com/)
 *   - jQuery UI 1.11 widget factory   (http://api.jqueryui.com/jQuery.widget/)
 *
 * Optional:
 *   - jQuery UI effects
 *   - jQuery UI position utility
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * References:
 * - http://api.jquery.com/jquery/
 * - http://api.jqueryui.com/jQuery.widget/
 * - http://learn.jquery.com/performance/optimize-selectors/
 * - https://www.audero.it/blog/2013/09/16/15-tips-to-improve-your-jquery-selectors
 * - https://stackoverflow.com/questions/327047/what-is-the-most-efficient-way-to-create-html-elements-using-jquery
 * - https://jsperf.com/jquery-vs-createelement
 * - https://jsperf.com/jquery-element-creationyay/19
 * - https://howchoo.com/g/mmu0nguznjg/learn-the-slow-and-fast-way-to-append-elements-to-the-dom
 * - https://stackoverflow.com/questions/1357118/event-preventdefault-vs-return-false
 * - https://blog.kevin-brown.com/select2/2014/12/15/jquery-js-performance.html
 * - https://jsperf.com/append-array-of-jquery-elements
 * - https://gist.github.com/adrienne/5341713
 *
 */
(function($, undefined) {
  // Counter used to prevent collisions
  var multiselectID = 0;
  var $doc = $(document);

   var defaultIcons = {
      'open': '<span class="ui-icon ui-icon-triangle-1-s"></span',
      'close': '<span class="ui-icon ui-icon-circle-close"></span>',
      'checkAll': '<span class="ui-icon ui-icon-check"></span>',
      'uncheckAll': '<span class="ui-icon ui-icon-closethick"></span>',
      'flipAll': '<span class="ui-icon ui-icon-arrowrefresh-1-w"></span>'
   };

  $.widget("ech.multiselect", {

    // default options
    options: {
      header: true,                        // (true | false) If true, the header is shown.
      height: 175,                         // (int) Sets the height of the menu.
      minWidth: 225,                       // (int) Sets the minimum width of the menu.
      classes: '',                         // Classes that you can provide to be applied to the elements making up the widget.
      iconSet: null,                       // (plain object | null) Supply an object of icons to use alternative icon sets, or null for default set.  Reference defaultIcons above for object structure.
      checkAllText: 'Check all',           // (str | blank | null) If blank, only icon shown.  If null, no icon, text or link is shown.
      uncheckAllText: 'Uncheck all',       // (str | blank | null) If blank, only icon shown.  If null, no icon, text or link is shown.
      flipAllText: null, //'Flip all',     // (str | blank | null) If blank, only icon shown.  If null, no icon, text or link is shown.
      noneSelectedText: 'Select options',  // (str) The text to show in the button where nothing is selected.
      selectedText: '# of # selected',     // (str) A "template" that indicates how to show the count of selections in the button.  The "#'s" are replaced by the selection count & option count.
      selectedList: 0,                     // (int) The actual list selections will be shown in the button when the count of selections is <= than this number.
      selectedMax: null,                   // (int | function)  If selected count > selectedMax or if function returns 1, then message is displayed, and new selection is undone.
      show: null,                          // (array) An array containing menu opening effects.
      hide: null,                          // (array) An array containing menu closing effects.
      autoOpen: false,                     // (true | false) If true, then the menu will be opening immediately after initialization.
      position: {},                        // (object) A jQuery UI position object that constrains how the pop-up menu is positioned.
      appendTo: null,                      // (jQuery | DOM element | selector str)  If provided, this specifies what element to append the widget to in the DOM.
      menuWidth:null,                      // (int | null) If a number is provided, sets the menu width.
      selectedListSeparator: ', ',         // (str) This allows customization of the list separator.  Use ',<br/>' to make the button grow vertically showing 1 selection per line.
      htmlButtonText: false,               // (true | false) If true, then the text used for the button's label is treated as html rather than plain text.
      htmlOptionText: false,               // (true | false) If true, then the text for option label is treated as html rather than plain text.
      disableInputsOnToggle: true,         // (true | false)
      groupColumns: false                  // (true | false)
    },

    // This method determines which element to append the menu to
    // Uses the element provided in the options first, then looks for ui-front / dialog
    // Otherwise appends to the body
    _getAppendEl: function() {
      var elem = this.options.appendTo;                    // jQuery object, DOM element, OR selector str.
      if(elem) {
        elem = elem.jquery || elem.nodeType ? $(elem) : this.document.find(elem).eq(0);  // Note that the find handles the selector case.
      }
      if(!elem || !elem[0]) {
        elem = this.element.closest(".ui-front, dialog");  // element is a jQuery object per http://api.jqueryui.com/jQuery.widget/
      }
      if(!elem.length) {
        elem = this.document[0].body;                      // Position at end of body.
      }
      return elem;
    },

    // Performs the initial creation of the widget
    _create: function() {
      var $element = this.element.hide();  // element property is a jQuery object
      var elSelect = $element.get(0);      // This would be expected to be the underlying native select element.
      var options = this.options;
      var classes = options.classes;
      var headerOn = options.header;
      var iconSet = $.extend({}, defaultIcons, options.iconSet || {});  // Do an extend here to handle icons missing from options.iconSet
      var checkAllText = options.checkAllText;
      var uncheckAllText = options.uncheckAllText;
      var flipAllText = options.flipAllText;

      this.speed = $.fx.speeds._default; // default speed for effects
      this._isOpen = false;                  // assume no

      // create a unique namespace for events that the widget
      // factory cannot unbind automatically. Use eventNamespace if on
      // jQuery UI 1.9+, and otherwise fallback to a custom string.
      this._namespaceID = this.eventNamespace || ('multiselect' + multiselectID);
      // bump unique ID after assigning it to the widget instance
      this.multiselectID = multiselectID++;

      // The button that opens the widget menu.  Note that this is inserted later below.
      var $button = (this.$button = $( document.createElement('button') ) )
           .addClass('ui-multiselect ui-widget ui-state-default ui-corner-all' + (classes ? ' ' + classes : ''))
           .attr({ 
                  'type': 'button', 
                  'title': elSelect.title, 
                  'tabIndex': elSelect.tabIndex, 
                  'id': elSelect.id ? elSelect.id  + '_ms' : null 
                })
           .prop('aria-haspopup', true)
           .html('<span class="ui-multiselect-open">' + iconSet.open + '</span>');   // Necessary to simplify dynamically changing the open icon.

        this.$buttonlabel = $( document.createElement('span') )
            .html(options.noneSelectedText)
            .appendTo( $button );

         // Header controls, will contain the check all/uncheck all buttons
         // Depending on how the options are set, this may be empty or simply plain text
         var headerLinksHTML = ( headerOn === true
               ?  (checkAllText === null ? '' : '<li><a class="ui-multiselect-all" title="Check All">' + iconSet.checkAll + (checkAllText ? '<span>' + checkAllText + '</span>' : '' ) + '</a></li>')
                  + (uncheckAllText === null ? '' : '<li><a class="ui-multiselect-none" title="Uncheck All">' + iconSet.uncheckAll + (uncheckAllText ? '<span>' + uncheckAllText + '</span>' : '' ) + '</a></li>')
                  + (flipAllText === null ? '' : '<li><a class="ui-multiselect-flip" title="Flip All">' + iconSet.flipAll + '<span>' + (flipAllText ? '<span>' + flipAllText + '</span>' : '' ) + '</a></li>')
               :  (typeof headerOn === 'string' ? '<li>' + headerOn + '</li>' : '') );

        this.$headerLinkContainer = $( document.createElement('ul') )
            .addClass('ui-helper-reset')
            .html(headerLinksHTML + '<li class="ui-multiselect-close"><a class="ui-multiselect-close" title="Close">' + iconSet.close + '</a></li>');

         // Menu header to hold controls for the menu
         var $header = (this.$header = $( document.createElement('div') ) )
            .addClass('ui-multiselect-header ui-widget-header ui-corner-all ui-helper-clearfix')
            .append( this.$headerLinkContainer );

         // Holds the actual check boxes for inputs
        var $checkboxContainer = (this.$checkboxContainer = $( document.createElement('ul') ) )
            .addClass('ui-multiselect-checkboxes ui-helper-reset');

         // This is the menu that will hold all the options.  If this is a single select widget, add the appropriate class.  Note that this is inserted below.
        var $menu = (this.$menu = $( document.createElement('div') ) )
            .addClass('ui-multiselect-menu ui-widget ui-widget-content ui-corner-all ' 
                      + (elSelect.multiple ? '' : 'ui-multiselect-single ') 
                      + classes)
            .append($header, $checkboxContainer);

        // We wait until everything is built before we insert in the DOM to limit browser re-flowing (an optimization).
        $button.insertAfter($element);
        $menu.appendTo( this._getAppendEl() );            // This is an empty menu at this point.

        // perform event bindings
        this._bindEvents();

        // build menu
        this.refresh(true);
    },

    // https://api.jqueryui.com/jquery.widget/#method-_init
    _init: function() {
      var elSelect = this.element.get(0);  // element is a jQuery object

      if (this.options.header)
         this.$headerLinkContainer.find('.ui-multiselect-all, .ui-multiselect-none, .ui-multiselect-flip')
           .toggle( !!elSelect.multiple );
      else
         this.$header.hide();

      if(this.options.autoOpen)
        this.open();

      if(elSelect.disabled)
        this.disable();
    },

    /*
    * Builds an option item for the menu
    * <li>
    *   <label>
    *     <input /> checkbox or radio depending on single/multiple select
    *     <span /> option text
    *   </label>
    * </li>
    */
    _makeOption: function(option) {
      var title = option.title || null;
      var elSelect = this.element.get(0);              // element is a jQuery object
      var id = elSelect.id || this.multiselectID;      // unique ID for the label & option tags
      var inputID = 'ui-multiselect-' + this.multiselectID + '-' + (option.id || id + '-option-' + this.inputIdCounter++);
      var isMultiple = elSelect.multiple;              // Pick up the select type from the underlying element
      var isDisabled = option.disabled;
      var isSelected = option.selected;

      var $input = $( document.createElement('input') )
                           .attr({
                             "name": "multiselect_" + id,
                             "type": isMultiple ? 'checkbox' : 'radio',
                             "value": option.value,
                             "title": title,
                             "id": inputID,
                             "checked": isSelected ? "checked" : null,
                             "aria-selected": isSelected ? "true" : null,
                             "disabled": isDisabled ? "disabled" : null,
                             "aria-disabled": isDisabled ? "true" : null
                           })
                           .data(option.dataset);

      var $span = this.options.htmlOptionText 
                  ? $( document.createElement('span') ).html( option.innerHTML ) 
                  : $( document.createElement('span') ).text( option.textContent );
      var optionImageSrc = option.getAttribute('data-image-src');
      if (optionImageSrc)
        $span.prepend( $( document.createElement('img') ).attr('src', optionImageSrc) );

     var $label = $( document.createElement('label') )
         .attr({ 'for': inputID,  'title': title})
         .addClass( (isDisabled ? 'ui-state-disabled ' : '') 
                   + (isSelected && !isMultiple ? 'ui-state-active ' : '') 
                   + 'ui-corner-all')
         .append($input, $span);

      var $item = $( document.createElement('li') )
         .addClass( (isDisabled ? 'ui-multiselect-disabled ' : '') + (option.className || '') )
         .append($label);

      return $item;
    },

    // Builds a menu item for each option in the underlying select
    // Option groups are built here as well
    _buildOptionList: function($element, $checkboxContainer) {
      var self = this;                                          // Save this => widget reference
      var list = [];

      this.inputIdCounter = 0;

      $element.children().each( function() {
        var elem = this;

        if (elem.tagName === 'OPTGROUP') {
           var options = [];

           $(elem).children().each( function() {
             options.push(self._makeOption(this));
           });
          
          // Build the list section for this optgroup, complete w/ option inputs.
          var $optionGroup = $( document.createElement('ul') )
                  .addClass('ui-multiselect-optgroup' 
                            + (self.options.groupColumns ? ' ui-multiselect-columns' : '') 
                            + (elem.className && ' ') + elem.className)
                  .append( $( document.createElement('a') ).text( elem.getAttribute('label') ), options);

           list.push($optionGroup);
        }
        else {
           list.push(self._makeOption(elem));
        }
      });

      $checkboxContainer.empty().append(list);
    },

    // Refreshes the widget to pick up changes to the underlying select
    // Rebuilds the menu, sets button width
    refresh: function(init) {
      var $element = this.element;   // "element" is a jQuery object

      // update header link container visibility if needed
      if (this.options.header)
         this.$headerLinkContainer.find('.ui-multiselect-all, .ui-multiselect-none, .ui-multiselect-flip')
           .toggle( !!$element[0].multiple );

      this._buildOptionList($element, this.$checkboxContainer);
      this._updateCache();

      this._setButtonWidth();
      this.update(true);

      // broadcast refresh event; useful for widgets
      if (!init)
        this._trigger('refresh');
    },

    // cache some more useful elements
    _updateCache: function() {
      this.$labels = this.$menu.find('label');
      this.$inputs = this.$labels.children('input');
    },

    // Update the button text. Call refresh() to rebuild the menu
    update: function(isDefault) {
      var options = this.options;
      var selectedList = options.selectedList;
      var selectedText = options.selectedText;
      var $inputs = this.$inputs;
      var inputCount = $inputs.length;
      var $checked = $inputs.filter(':checked');
      var numChecked = $checked.length;
      var value;

      if (numChecked) {
        if (typeof selectedText === 'function')
          value = selectedText.call(this, numChecked, inputCount, $checked.get());
        else if(/\d/.test(selectedList) && selectedList > 0 && numChecked <= selectedList)
          value = $checked.map(function() { return $(this).next().text() }).get().join(options.selectedListSeparator);
        else
          value = selectedText.replace('#', numChecked).replace('#', inputCount);
      }
      else
        value = options.noneSelectedText;

      this._setButtonValue(value, isDefault);

      // Check if the menu needs to be repositioned due to button height changing from adding/removing selections.
      if (this._isOpen && this._savedButtonHeight != this.$button.outerHeight(false))
         this.position();
    },

    // this exists as a separate method so that the developer
    // can easily override it.
    _setButtonValue: function(value, isDefault) {
      this.$buttonlabel[this.options.htmlButtonText ? 'html' : 'text'](value);

      if (!!isDefault)
        this.$button[0].defaultValue = value;
    },

    _bindButtonEvents: function() {
      var self = this;
      var $button = this.$button;
      function clickHandler() {
        self[ self._isOpen ? 'close' : 'open' ]();
        return false;
      }

      $button       // button events
        .on({
           click: clickHandler,
           keypress: function(e) {
             switch(e.which) {
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
           mouseenter: function() {
             if(!$button.hasClass('ui-state-disabled')) {
               $button.addClass('ui-state-hover');
             }
           },
           mouseleave: function() {
             $button.removeClass('ui-state-hover');
           },
           focus: function() {
             if(!$button.hasClass('ui-state-disabled')) {
               $button.addClass('ui-state-focus');
             }
           },
           blur: function() {
             $button.removeClass('ui-state-focus');
           }
         })
         .find('span')     // webkit doesn't like it when you click on the span :(
         .on('click.multiselect', clickHandler);
    },

    _bindMenuEvents: function() {
      var self = this;
      // optgroup label toggle support
      this.$menu.on('click.multiselect', '.ui-multiselect-optgroup a', function(e) {
        e.preventDefault();

        var $this = $(this);
        var $inputs = $this.parent().find('input').filter(':visible:not(:disabled)');
        var nodes = $inputs.get();
        var label = this.textContent;

        // trigger event and bail if the return is false
        if(self._trigger('beforeoptgrouptoggle', e, { inputs:nodes, label:label }) === false) {
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
          checked: nodes.length ? nodes[0].checked : null
        });
      })
      .on('mouseenter.multiselect', 'label', function() {
        if(!$(this).hasClass('ui-state-disabled')) {
          self.$labels.removeClass('ui-state-hover');
          $(this).addClass('ui-state-hover').find('input').focus();
        }
      })
      .on('keydown.multiselect', 'label', function(e) {
        if(e.which === 82)
          return; //"r" key, often used for reload.

        if(e.which > 111 && e.which < 124)
          return; //Keyboard function keys.

        e.preventDefault();
        switch(e.which) {
          case 9: // tab
            if(e.shiftKey) {
              self.$menu.find(".ui-state-hover").removeClass("ui-state-hover");
              self.$header.find("li").last().find("a").focus();
            }
            else
              self.close();
            break;
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
          case 32: // space
            $(this).find('input')[0].click();
            break;
          case 65:   // Ctrl-A
            if (e.altKey)
              self.checkAll();
            break;
          case 85:   // Ctrl-U
            if (e.altKey)
              self.uncheckAll();
            break;
        }
      })
      .on('click.multiselect', 'input[type="checkbox"], input[type="radio"]', function(e) {
        var $this = $(this);
        var val = this.value;
        var checked = this.checked;
        var $element = self.element;
        var options = self.options;
        var $inputs = self.$inputs;
        var optionText = $this.parent().find("span")[options.htmlOptionText ? 'html' : 'text']();
        var $tags = $element.find('option');
        var isMultiple = $element[0].multiple;
        var inputCount = $inputs.length;
        var numChecked = $inputs.filter(":checked").length;
        var selectedMax = options.selectedMax;

        // bail if this input is disabled or the event is cancelled
        if(this.disabled || self._trigger('click', e, { value: val, text: optionText, checked: checked }) === false) {
          e.preventDefault();
          return;
        }

        if ( selectedMax && checked && ( typeof selectedMax === 'function' ? !!selectedMax.call(this, $inputs) : numChecked > selectedMax ) ) {
          var saveText = options.selectedText;

          // The following warning is shown in the button and then cleared after a second.
          options.selectedText = "<center><b>LIMIT OF " + (numChecked - 1) + " REACHED!</b></center>";
          self.update();
          setTimeout( function() {
            options.selectedText = saveText;
            self.update();
          }, 1000 );

          this.checked = false;              // Kill the event.
          e.preventDefault();
          return false;
        }

        // make sure the input has focus. otherwise, the esc key
        // won't close the menu after clicking an item.
        $this.focus();

        // toggle aria state
        $this.prop('aria-selected', checked);

        // change state on the original option tags
        $tags.each( function() {
          this.selected = (this.value === val ? checked : isMultiple && this.selected);
        });

        // some additional single select-specific logic
        if(!isMultiple) {
          self.$labels.removeClass('ui-state-active');
          $this.closest('label').toggleClass('ui-state-active', checked);

          // close menu
          self.close();
        }

        // fire change on the select box
        $element.trigger("change");

        // setTimeout is to fix multiselect issue #14 and #47. caused by jQuery issue #3827
        // http://bugs.jquery.com/ticket/3827
        setTimeout($.proxy(self.update, self), 10);
      });
    },

    _bindHeaderEvents: function() {
      var self = this;
      // header links
      this.$header
      .on('click.multiselect', 'a', function(e) {
        var $this = $(this);
        var headerLinks = {
                            'ui-multiselect-close' : 'close',  
                            'ui-multiselect-all' : 'checkAll', 
                            'ui-multiselect-none' : 'uncheckAll', 
                            'ui-multiselect-flip' : 'flipAll'
                          };
        for (hdgClass in headerLinks) {
            if ( $this.hasClass(hdgClass) ) {
               self[ headerLinks[hdgClass] ]();   // headerLinks[hdgClass] is the click handler name
               e.preventDefault();
               return false;                      // Break out of loop early
            }
         }
      })
      .on('keydown.multiselect', 'a', function(e) {
        switch(e.which) {
          case 27:
            self.close();
            break;
          case 9:
            var $target = $(e.target);
            if((e.shiftKey && !$target.parent().prev().length && !self.$header.find(".ui-multiselect-filter").length) || (!$target.parent().next().length && !self.$labels.length && !e.shiftKey)) {
              self.close();
              e.preventDefault();
            }
            break;
        }
      });
    },

    // binds events
    _bindEvents: function() {
      var self = this;

      this._bindButtonEvents();
      this._bindMenuEvents();
      this._bindHeaderEvents();

      // close each widget when clicking on any other element/anywhere else on the page
      $doc.on('mousedown.' + self._namespaceID, function(event) {
        var target = event.target;
        var button = self.$button.get(0);
        var menu = self.$menu.get(0);

        if ( self._isOpen && button !== target && !$.contains(button, target) && menu !== target && !$.contains(menu, target) )
          self.close();
      });

      // deal with form resets.  the problem here is that buttons aren't
      // restored to their defaultValue prop on form reset, and the reset
      // handler fires before the form is actually reset.  delaying it a bit
      // gives the form inputs time to clear.
      $(this.element[0].form).on('reset.' + this._namespaceID, function() {
        setTimeout($.proxy(self.refresh, self), 10);
      });
    },

    // Determines the minimum width for the button and menu
    // Can be a number, a digit string, or a percentage
    _getMinWidth: function() {
      var minVal = this.options.minWidth;
      var width = 0;
      switch (typeof minVal) {
        case 'number':
          width = minVal;
          break;
        case 'string':
          var lastChar = minVal[ minVal.length -1 ];
          width = minVal.match(/\d+/);
          if(lastChar === '%') {
            width = this.element.parent().outerWidth() * (width/100);      // element is a jQuery object
          } else {
            width = parseInt(minVal, 10);
          }
          break;
      }
      return width;
    },

    // set button width
    _setButtonWidth: function() {
      var width = this.element.outerWidth();    // element is a jQuery object
      var minVal = this._getMinWidth();

      if(width < minVal) {
        width = minVal;
      }
      // set widths
      this.$button.outerWidth(width);
    },

    // set menu width
    _setMenuWidth: function() {
      var width = (this.$button.outerWidth() <= 0) ? this._getMinWidth() : this.$button.outerWidth();
      this.$menu.outerWidth(this.options.menuWidth || width);
    },

    // Sets the height of the menu
    // Will set a scroll bar if the menu height exceeds that of the height in options
    _setMenuHeight: function() {
      var $menu = this.$menu;
      var headerHeight = $menu.children('.ui-multiselect-header').filter(':visible').outerHeight(true);
      var ulHeight = 0;

      $menu.find('.ui-multiselect-checkboxes li, .ui-multiselect-checkboxes a').each( function() {
        ulHeight += $(this).outerHeight(true);
      });

      if(ulHeight > this.options.height) {
        $menu.children(".ui-multiselect-checkboxes").css("overflow", "auto");
        ulHeight = this.options.height;
      }
      else
        $menu.children(".ui-multiselect-checkboxes").css("overflow", "hidden");

      $menu.children(".ui-multiselect-checkboxes").height(ulHeight);
      $menu.height(ulHeight + headerHeight);
    },

     // Resizes the menu, called every time the menu is opened
    _resizeMenu: function() {
      this._setMenuWidth();
      this._setMenuHeight();
    },

    // move up or down within the menu
    _traverse: function(which, start) {
      var $start = $(start);
      var moveToLast = which === 38 || which === 37;

      // select the first li that isn't an optgroup label / disabled
      var $next = $start.parent()[moveToLast ? 'prevAll' : 'nextAll']('li:not(.ui-multiselect-disabled, .ui-multiselect-optgroup):visible').first();
      // we might have to jump to the next/previous option group
      if (!$next.length)
        $next = $start.parents(".ui-multiselect-optgroup")[moveToLast ? "prev" : "next" ]();

      // if at the first/last element
      if (!$next.length) {
        var $container = this.$menu.find('ul').last();

        // move to the first/last
        this.$menu.find('label').filter(':visible')[ moveToLast ? 'last' : 'first' ]().trigger('mouseover');

        // set scroll position
        $container.scrollTop(moveToLast ? $container.height() : 0);

      }
      else
        $next.find('label').filter(':visible')[ moveToLast ? "last" : "first" ]().trigger('mouseover');

    },

    // This is an internal function to toggle the checked property and
    // other related attributes of a checkbox.
    //
    // The context of this function should be a checkbox; do not proxy it.
    _toggleState: function(prop, flag) {
      return function() {
         var state = (flag === '!') ? !this[prop] : flag;

         if( !this.disabled )
          this[ prop ] = state;

        if (state)
          this.setAttribute('aria-' + prop, true);
        else
          this.removeAttribute('aria-' + prop);

      };
    },

    // Toggles checked state on either an option group or all inputs
    _toggleChecked: function(flag, group) {
      var self = this;
      var $element = this.element;                 // element is a jQuery object
      var $inputs = (group && group.length) ? group : this.$inputs;
      var inputCount = $inputs.length;

      // toggle state on inputs
      $inputs.each(this._toggleState('checked', flag));

      // Give the first input focus
      $inputs.eq(0).focus();

      // update button text
      this.update();

      // Create a plain object of the values that actually changed
      var values = {};
      for (var x = 0; x < inputCount; x++) {
        values[ $inputs.get(x).value ] = true;
      };

      // toggle state on original option tags
      $element[0].selectedIndex = -1;
      $element
         .find('option')
         .each( function() {
            if(!this.disabled && values[this.value])
               self._toggleState('selected', flag).call(this);
         });

      // trigger the change event on the select
      if (inputCount)
        $element.trigger("change");
    },

      // Toggle disable state on the widget and underlying select
    _toggleDisabled: function(flag) {
      this.$button.prop({ 'disabled':flag, 'aria-disabled':flag })[ flag ? 'addClass' : 'removeClass' ]('ui-state-disabled');

      if(this.options.disableInputsOnToggle) {
        var checkboxes = this.$menu.find(".ui-multiselect-checkboxes").get(0);
        var matchedInputs = [];
        var key = "ech-multiselect-disabled";
        var i = 0;
        if(flag) {
          // remember which elements this widget disabled (not pre-disabled)
          // elements, so that they can be restored if the widget is re-enabled.
          matchedInputs = checkboxes.querySelectorAll("input:enabled");
          for(i = 0; i < matchedInputs.length; i++) {
            matchedInputs[i].setAttribute(key, true);
            matchedInputs[i].setAttribute("disabled", "disabled");
            matchedInputs[i].setAttribute("aria-disabled", "disabled");
            matchedInputs[i].parentNode.className = matchedInputs[i].parentNode.className + " ui-state-disabled";
          }
        } else {
          matchedInputs = checkboxes.querySelectorAll("input:disabled");
          for(i = 0; i < matchedInputs.length; i++) {
            if(matchedInputs[i].hasAttribute(key)) {
              matchedInputs[i].removeAttribute(key);
              matchedInputs[i].removeAttribute("disabled");
              matchedInputs[i].removeAttribute("aria-disabled");
              matchedInputs[i].parentNode.className = matchedInputs[i].parentNode.className.replace(" ui-state-disabled", "");
            }
          }
        }
      }

      this.element.prop({    // element is a jQuery object
        'disabled':flag,
        'aria-disabled':flag
      });
    },

    // open the menu
    open: function(e) {
      var self = this;
      var $button = this.$button;
      var $menu = this.$menu;
      var $header = this.$header;
      var $labels = this.$labels;
      var speed = this.speed;
      var options = this.options;
      var effect = options.show;
      var $container = $menu.find('.ui-multiselect-checkboxes');

      // bail if the multiselectopen event returns false, this widget is disabled, or is already open
      if(this._trigger('beforeopen') === false || $button.hasClass('ui-state-disabled') || this._isOpen)
        return;

      // figure out opening effects/speeds
      if ($.isArray(options.show)) {
        effect = options.show[0];
        speed = options.show[1] || self.speed;
      }

      // set the scroll of the checkbox container
      $container.scrollTop(0);

      // show the menu, maybe with a speed/effect combo
      // if there's an effect, assume jQuery UI is in use
      $.fn.show.apply($menu, effect ? [ effect, speed ] : []);

      this._resizeMenu();
      // positon
      this.position();

      // select the first not disabled option or the filter input if available
      var filter = $header.find(".ui-multiselect-filter");
      if (filter.length)
        filter.first().find('input').trigger('focus');
      else if ($labels.length) {
        $labels.filter(':not(.ui-state-disabled)').eq(0)
          .trigger('mouseover').trigger('mouseenter').find('input').trigger('focus');
      }
      else
        $header.find('a').first().trigger('focus');

      $button.addClass('ui-state-active');
      this._isOpen = true;
      this._trigger('open');
    },

    // close the menu
    close: function() {
      if (this._trigger('beforeclose') === false)
        return;

      var options = this.options;
      var effect = options.hide;
      var speed = this.speed;
      var $button = this.$button;

      // figure out closing effects/speeds
      if ($.isArray(options.hide)) {
        effect = options.hide[0];
        speed = options.hide[1] || this.speed;
      }

      $.fn.hide.apply(this.$menu, effect ? [ effect, speed ] : []);
      $button.removeClass('ui-state-active').trigger('blur').trigger('mouseleave');
      this._isOpen = false;
      this._trigger('close');
      $button.trigger('focus');
    },

    enable: function() {
      this._toggleDisabled(false);
    },

    disable: function() {
      this._toggleDisabled(true);
    },

    checkAll: function(e) {
      this._toggleChecked(true);
      this._trigger('checkAll');
    },

    uncheckAll: function() {
      this._toggleChecked(false);
      if ( !this.element[0].multiple )                   // element is a jQuery object
         this.element[0].selectedIndex = -1;       // Forces the underlying single-select to have no options selected.
      this._trigger('uncheckAll');
    },

    flipAll: function() {
      this._toggleChecked('!');
      this._trigger('flipAll');
    },

    getChecked: function() {
      return this.$menu.find('input:checked');
    },

    getUnchecked: function() {
      return this.$menu.find('input:not(:checked)');
    },

    destroy: function() {
      // remove classes + data
      $.Widget.prototype.destroy.call(this);

      // unbind events
      $doc.off(this._namespaceID);
      $(this.element[0].form).off(this._namespaceID);       // element is a jQuery object

      this.$button.remove();
      this.$menu.remove();
      this.element.show();

      return this;
    },

    isOpen: function() {
      return this._isOpen;
    },

    widget: function() {
      return this.$menu;
    },

    getButton: function() {
      return this.$button;
    },

    getMenu: function() {
      return this.$menu;
    },

    getLabels: function() {
      return this.$labels;
    },

     /*
    * Adds an option to the widget and underlying select
    * attributes: Attributes hash to add to the option
    * text: text of the option
    * groupLabel: Option Group to add the option to
    */
    addOption: function(attributes, text, groupLabel) {
      var $element = this.element;
      var $menu = this.$menu;
      var $option = $( document.createElement('option') ).attr(attributes).text(text);
      var optionNode = $option.get(0);

      if (groupLabel) {
         $element.children("OPTGROUP").filter(function() {
            return $(this).prop("label") === groupLabel;
         }).append($option);
         $menu.find(".ui-multiselect-optgroup").filter(function() {
            return $(this).find("a").text() === groupLabel;
         }).append(this._makeOption(optionNode));
      }
      else {
        $element.append($option);
        $menu.find(".ui-multiselect-checkboxes").append(this._makeOption(optionNode));
      }

      this._updateCache();       //update cached elements
    },

    removeOption: function(value) {
      if (!value)
        return;
      this.element.find("option[value=" + value + "]").remove();
      this.$labels.find("input[value=" + value + "]").parents("li").remove();

      this._updateCache();       //update cached elements
    },

    position: function() {
      this._savedButtonHeight = this.$button.outerHeight(false);           // Save this so that we can determine when the button height has changed due adding/removing selections.
      var pos = {
        my: "top",
        at: "bottom",
        of: this.$button
      };
      if(!$.isEmptyObject(this.options.position)) {
        pos.my = this.options.position.my || pos.my;
        pos.at = this.options.position.at || pos.at;
        pos.of = this.options.position.of || pos.of;
      }
      if($.ui && $.ui.position)
        this.$menu.position(pos);
      else {
        pos = this.$button.position();
        pos.top += this._savedButtonHeight;
        this.$menu.offset(pos);
      }
    },

    // react to option changes after initialization
    _setOption: function(key, value) {
      var $menu = this.$menu;

      switch(key) {
        case 'header':
          if (typeof value === 'boolean')
            this.$header.toggle( value );
          else if(typeof value === 'string') {
            this.$headerLinkContainer.children('li:not(:last-child)').remove();
            this.$headerLinkContainer.prepend('<li>' + value + '</li>');
          }
          break;
        case 'checkAllText':
        case 'uncheckAllText':
        case 'flipAllText':
          $menu.find('a.ui-multiselect-' + {'checkAllText': 'all', 'uncheckAllText': 'none', 'flipAllText': 'flip'}[key] + ' span').eq(-1).text(value);           // eq(-1) finds the last span
          break;
        case 'checkAllIcon':
        case 'uncheckAllIcon':
        case 'flipAllIcon':
          $menu.find('a.ui-multiselect-' + {'checkAllIcon': 'all', 'uncheckAllIcon': 'none', 'flipAllIcon': 'flip'}[key] + ' span').eq(0).replaceWith(value);  // eq(0) finds the first span
          break;
        case 'openIcon':
          $menu.find('span.ui-multiselect-open').html(value);
          break;
        case 'closeIcon':
          $menu.find('a.ui-multiselect-close').html(value);
          break;
        case 'height':
          this.options[key] = value;
          this._setMenuHeight();
          break;
        case 'minWidth':
        case 'menuWidth':
          this.options[key] = value;
          this._setButtonWidth();
          this._setMenuWidth();
          break;
        case 'selectedText':
        case 'selectedList':
        case 'selectedMax':
        case 'noneSelectedText':
          this.options[key] = value;            // these all need to update immediately for the update() call
          this.update();
          break;
        case 'classes':
          $menu.add(this.$button).removeClass(this.options.classes).addClass(value);
          break;
        case 'multiple':
          var $element = this.element;
          if (!!$element[0].multiple !== value) {
             $menu.toggleClass('ui-multiselect-multiple', value).toggleClass('ui-multiselect-single', !value);
             $element[0].multiple = value;
             this.uncheckAll();
             this.refresh();
          }
          break;
        case 'position':
          this.position();
          break;
        case 'selectedListSeparator':
          this.options[key] = value;
          this.update(true);
          break;
      }
      $.Widget.prototype._setOption.apply(this, arguments);
    }

  });

})(jQuery);
