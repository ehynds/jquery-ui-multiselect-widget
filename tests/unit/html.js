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

	test("pull in optgroup's data-* attributes", function () {
		var expected = $("select optgroup[data-test]")
		expect(1);

		elems = widget.find('.ui-multiselect-optgroup-label[data-test]');
		equals(elems.length, expected.length, 'copied data-test attributes ' + expected.length + ' times.');
	});

	test("pull in options's class", function(){
		expect(1);

		equals(widget.find('input[value="9"]').parents('li:first').hasClass('optionClass'),true,'Extra class is present');
	});

	test("pull in options's data-* attributes", function () {
		var expected = $("select option[data-test]")
		expect(1);

		elems = widget.find('li[data-test]:not(.ui-multiselect-optgroup-label)');
		equals(elems.length, expected.length, 'copied data-test attributes ' + expected.length + ' times.');
	});
})(jQuery);
