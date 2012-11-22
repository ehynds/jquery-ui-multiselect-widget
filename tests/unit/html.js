(function($){
	var el, widget, elems;

	module("html", {
		setup: function() {
			el = $("select").multiselect();
			widget = el.multiselect("widget");
		}
	});

	test("pull in optgroup's class", function(){
		expect(5);

		elems = widget.find('.ui-multiselect-optgroup-label');
		equals( elems.length, 3, 'There are three labels' );

		elems.filter(":not(:last)").each( function() {
			equals($(this).hasClass('ui-multiselect-optgroup-label'),true,'Default class is present when no extra class is defined');
		});
		elems.filter(":last").each( function() {
			equals($(this).hasClass('ui-multiselect-optgroup-label'),true,'Default class is present when extra class is defined');
			equals($(this).hasClass('optgroupClass'),true,'Extra class is present');
		});

	});

	test("pull in options's class", function(){
		expect(1);

		equals(widget.find('input[value="9"]').parents('li:first').hasClass('optionClass'),true,'Extra class is present');
	});

    test("verify ul/li counts", function() {
        expect(7);

        parent = widget.find(".ui-multiselect-checkboxes");

        equals(parent.find('ul').length, 6, 'Correct number of unordered lists is present (five due to optgroups, one without)');

        equals(parent.find('ul:nth-child(1)').find('li').length, 4, 'Correct number of list items in first optgroup (one label + three items)');
        equals(parent.find('ul:nth-child(2)').find('li').length, 5, 'Correct number of list items in second optgroup (one label + four items)');
        equals(parent.find('ul:nth-child(3)').find('li').length, 3, 'Correct number of list items in third optgroup (one label + two items)');
        equals(parent.find('ul:nth-child(4)').find('li').length, 1, 'Correct number of list items in fourth optgroup (one item)');
        equals(parent.find('ul:nth-child(5)').find('li').length, 1, 'Correct number of list items in fifth optgroup (one item)');
        equals(parent.find('ul:nth-child(6)').find('li').length, 2, 'Correct number of list items without optgroup (two items)');
    });

})(jQuery);
