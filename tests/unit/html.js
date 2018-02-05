(function($){
	var el, widget, elems, btn, selectClone;

	QUnit.module("html", {
		beforeEach: function() {
			el = $("select").multiselect();
			widget = el.multiselect("widget");
            btn = el.multiselect("getButton");
            selectClone = $("select").clone();
		}
	});

	QUnit.test("pull in optgroup's class", function(assert){
		elems = widget.find('.ui-multiselect-optgroup');
		assert.equal( elems.length, 3, 'There are three labels' );

		elems.filter(":not(:last)").each( function() {
			assert.equal($(this).hasClass('ui-multiselect-optgroup'),true,'Default class is present when no extra class is defined');
		});
		elems.filter(":last").each( function() {
			assert.equal($(this).hasClass('ui-multiselect-optgroup'),true,'Default class is present when extra class is defined');
			assert.equal($(this).hasClass('optgroupClass'),true,'Extra class is present');
		});

	});

	QUnit.test("pull in options's class", function(assert){
		assert.equal(widget.find('input[value="9"]').parents('li:first').hasClass('optionClass'),true,'Extra class is present');
	});

    QUnit.test("pull in select's ID and adds _ms if it exists", function(assert){
        assert.equal(btn.attr("id"), el.attr("id") + "_ms", "Id is taken from select and _ms is appended");
    });

    QUnit.test("don't attempt to pull in select's ID and adds _ms if none exists", function(assert){
        selectClone.attr("id", "");
        var clonedEl = selectClone.multiselect();
        var clonedBtn = clonedEl.multiselect("getButton");
        assert.equal(clonedBtn.attr("id"), undefined, "No ID is added");
    });

})(jQuery);
