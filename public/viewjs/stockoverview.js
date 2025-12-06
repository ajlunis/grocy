

var stockOverviewTable = $('#stock-overview-table').DataTable({
	'order': [[5, 'asc']],
	'columnDefs': [
		{ 'orderable': false, 'targets': 0 },
		{ 'searchable': false, "targets": 0 },
		{ 'searchable': false, "targets": 0 },
		{ 'visible': false, 'targets': 6 },
		{ 'visible': false, 'targets': 7 },
		{ 'visible': false, 'targets': 8 },
		{ 'visible': false, 'targets': 2 },
		{ 'visible': false, 'targets': 4 },
		{ 'visible': false, 'targets': 9 },
		{ 'visible': false, 'targets': 10 },
		{ 'visible': false, 'targets': 11 },
		{ 'visible': false, 'targets': 12 },
		{ 'visible': false, 'targets': 13 },
		{ 'visible': false, 'targets': 14 },
		{ 'visible': false, 'targets': 15 },
		{ 'visible': false, 'targets': 16 },
		{ 'visible': false, 'targets': 17 },
		{ 'visible': false, 'targets': 18 },
		{ 'visible': false, 'targets': 19 },
		{ "type": "custom-sort", "targets": 3 },
		{ "type": "html-num-fmt", "targets": 9 },
		{ "type": "html-num-fmt", "targets": 10 },
		{ "type": "html", "targets": 5 },
		{ "type": "html", "targets": 11 },
		{ "type": "custom-sort", "targets": 12 },
		{ "type": "html-num-fmt", "targets": 13 },
		{ "type": "custom-sort", "targets": 4 },
		{ "type": "custom-sort", "targets": 18 }
	].concat($.fn.dataTable.defaults.columnDefs)
});

$('#stock-overview-table tbody').removeClass("d-none");
stockOverviewTable.columns.adjust().draw();

function GetFilterRegex(selectedValues)
{
	if (!selectedValues || selectedValues.length === 0)
	{
		return "";
	}

	// Escape special regex characters in the values
	selectedValues = selectedValues.map(function(value) {
		return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
	});

	return "^(" + selectedValues.join("|") + ")$";
}

$("#location-filter").on("change", function()
{
	var values = $(this).val();
	var regex = "";

	if (values && values.length > 0)
	{
		// Location names in the hidden column are wrapped in "xx"
		regex = "xx(" + values.map(function(v) { return v.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'); }).join("|") + ")xx";
	}
	else
	{
		// If nothing is selected, show nothing (impossible condition for locations as all have one, but consistent logic)
		regex = "^$";
	}

	stockOverviewTable.column(stockOverviewTable.colReorder.transpose(6)).search(regex, true, false).draw();
});

$("#product-group-filter").on("change", function()
{
	// For product groups, we need the text of the selected options
	var selectedOptions = $("#product-group-filter option:selected");
	var values = [];
	selectedOptions.each(function() {
		values.push($(this).text());
	});

	var regex = "";
	if (values && values.length > 0)
	{
		// Product group names in the hidden column are wrapped in "xx"
		regex = "xx(" + values.map(function(v) {
			if (v === __t("<No Product Group>")) {
				return "";
			}
			return v.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
		}).join("|") + ")xx";
	}
	else
	{
		// If nothing is selected, show nothing
		regex = "^$";
	}

	stockOverviewTable.column(stockOverviewTable.colReorder.transpose(8)).search(regex, true, false).draw();
});

$("#status-filter").on("change", function()
{
	var values = $(this).val();
	var regex = GetFilterRegex(values);

	stockOverviewTable.column(stockOverviewTable.colReorder.transpose(7)).search(regex, true, false).draw();
});

$(".status-filter-message").on("click", function()
{
	var value = $(this).data("status-filter");
	$("#status-filter").selectpicker('val', value);
});

$("#clear-filter-button").on("click", function()
{
	$("#search").val("");
	$("#status-filter").selectpicker('val', []);
	$("#product-group-filter").selectpicker('val', []);
	$("#location-filter").selectpicker('val', []);

	// Clear userfield filters
	$("#userfield-filters-container").empty();

	stockOverviewTable.column(stockOverviewTable.colReorder.transpose(6)).search("").draw();
	stockOverviewTable.column(stockOverviewTable.colReorder.transpose(7)).search("").draw();
	stockOverviewTable.column(stockOverviewTable.colReorder.transpose(8)).search("").draw();

	// Clear all other columns searches (userfields)
	stockOverviewTable.columns().search("");

	stockOverviewTable.search("").draw();
});

$("#search").on("keyup", Delay(function()
{
	var value = $(this).val();
	if (value === "all")
	{
		value = "";
	}

	stockOverviewTable.search(value).draw();
}, Grocy.FormFocusDelay));

// Trigger initial filter change to apply default selections
$("#location-filter, #product-group-filter").trigger("change");

// Userfield Filtering System
$("#add-userfield-filter-button").on("click", function()
{
	var availableUserfields = [];

	// Find visible userfield columns
	if (typeof Grocy.Userfields !== 'undefined')
	{
		$.each(Grocy.Userfields, function(index, userfield)
		{
			// Whitelist types that make sense for a dropdown filter
			var supportedTypes = ["text", "number-integral", "number-decimal", "date", "datetime", "checkbox", "preset-list", "select"];
			if (userfield.show_as_column_in_tables == 1 && supportedTypes.includes(userfield.type))
			{
				availableUserfields.push(userfield);
			}
		});
	}

	if (availableUserfields.length === 0)
	{
		bootbox.alert({
			message: __t("No userfields are available for filtering."),
			backdrop: true,
			closeButton: false
		});
		return;
	}

	var optionsHtml = "";
	$.each(availableUserfields, function(index, userfield)
	{
		optionsHtml += '<option value="' + userfield.id + '">' + userfield.caption + '</option>';
	});

	bootbox.dialog({
		title: __t("Add filter"),
		message: '<select class="form-control" id="add-userfield-filter-select">' + optionsHtml + '</select>',
		buttons: {
			cancel: {
				label: __t('Cancel'),
				className: 'btn-secondary',
				callback: function() {}
			},
			ok: {
				label: __t('OK'),
				className: 'btn-primary',
				callback: function()
				{
					var selectedUserfieldId = $("#add-userfield-filter-select").val();
					var selectedUserfield = availableUserfields.find(x => x.id == selectedUserfieldId);
					AddUserfieldFilter(selectedUserfield);
				}
			}
		}
	});
});

function AddUserfieldFilter(userfield)
{
	// Find column index based on header text
	var columnIndex = -1;
	stockOverviewTable.columns().every(function(index)
	{
		var header = $(this.header()).text().trim();
		if (header === userfield.caption)
		{
			columnIndex = index;
			return false; // break
		}
	});

	if (columnIndex === -1)
	{
		console.error("Column for userfield '" + userfield.caption + "' not found.");
		return;
	}

	var filterId = "userfield-filter-" + userfield.id;
	if ($("#" + filterId).length > 0)
	{
		return;
	}

	// Get unique values from the column
	var uniqueValues = stockOverviewTable.column(columnIndex).data().unique().sort().toArray();
	var distinctValues = [];
	var hasEmptyValue = false;

	$.each(uniqueValues, function(index, value)
	{
		// Strip HTML tags to get the clean value
		var tempDiv = document.createElement("div");
		tempDiv.innerHTML = value;
		var textValue = tempDiv.textContent || tempDiv.innerText || "";
		textValue = textValue.trim();

		if (textValue !== "" && !distinctValues.includes(textValue))
		{
			distinctValues.push(textValue);
		}

		if (textValue === "")
		{
			hasEmptyValue = true;
		}
	});

	var optionsHtml = "";
	if (hasEmptyValue)
	{
		optionsHtml += '<option value="<EMPTY>">' + __t("<Not set>") + '</option>';
	}

	if (userfield.type === "checkbox")
	{
		// For checkboxes, usually they are rendered as icons (checked) or empty (unchecked)
		// If we found "empty", that's "No". If we found anything else (the icon), that's "Yes" (but logic above stripped it to empty string if it was just an icon?)
		// Actually, <i class="fa-check"></i> text content IS empty.
		// So for checkbox, we need to look at HTML.

		var hasChecked = false;
		var hasUnchecked = false;

		$.each(uniqueValues, function(index, value)
		{
			if (value.includes("fa-check"))
			{
				hasChecked = true;
			}
			else
			{
				hasUnchecked = true;
			}
		});

		// Clear previous options as we are building custom ones
		optionsHtml = "";
		if (hasUnchecked)
		{
			optionsHtml += '<option value="<EMPTY>">' + __t("No") + '</option>';
		}
		if (hasChecked)
		{
			optionsHtml += '<option value="fa-check">' + __t("Yes") + '</option>';
		}
	}
	else
	{
		$.each(distinctValues, function(index, value)
		{
			optionsHtml += '<option value="' + value + '">' + value + '</option>';
		});
	}

	var filterHtml = '<div class="input-group col-12 col-md-6 col-xl-3 mb-2" id="' + filterId + '">' +
		'<div class="input-group-prepend">' +
			'<span class="input-group-text"><i class="fa-solid fa-filter"></i>&nbsp;' + userfield.caption + '</span>' +
		'</div>' +
		'<select class="custom-control custom-select selectpicker" multiple data-actions-box="true" data-column-index="' + columnIndex + '">' +
			optionsHtml +
		'</select>' +
		'<div class="input-group-append">' +
			'<button class="btn btn-outline-danger remove-userfield-filter-button" type="button"><i class="fa-solid fa-trash"></i></button>' +
		'</div>' +
	'</div>';

	$("#userfield-filters-container").append(filterHtml);
	var selectElement = $("#" + filterId + " select");
	selectElement.selectpicker();

	// Select all by default
	selectElement.selectpicker("selectAll");

	selectElement.on("change", function()
	{
		var selectedValues = $(this).val();
		var regex = "";
		if (selectedValues && selectedValues.length > 0)
		{
			var parts = [];
			selectedValues.forEach(function(val) {
				if (val === "<EMPTY>")
				{
					// Match empty cell or cell with no visible text (for checkbox "No")
					// For checkbox, "No" is empty string or no fa-check.
					// But DataTables search on render is tricky.
					// Regex for empty string: ^$
					parts.push("^$");

					// Also match whitespace only
					parts.push("^\\s+$");
				}
				else
				{
					parts.push(val.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'));
				}
			});
			regex = "(" + parts.join("|") + ")";
		}
		else
		{
			// If nothing selected, match nothing
			regex = "^$";
		}

		stockOverviewTable.column(columnIndex).search(regex, true, false).draw();
	});

	$("#" + filterId + " .remove-userfield-filter-button").on("click", function()
	{
		stockOverviewTable.column(columnIndex).search("").draw();
		$("#" + filterId).remove();
	});
}



$(document).on('click', '.product-grocycode-label-print', function(e)
{
	e.preventDefault();

	var productId = $(e.currentTarget).attr('data-product-id');
	Grocy.Api.Get('stock/products/' + productId + '/printlabel', function(labelData)
	{
		if (Grocy.Webhooks.labelprinter !== undefined)
		{
			Grocy.FrontendHelpers.RunWebhook(Grocy.Webhooks.labelprinter, labelData);
		}
	});
});

$(document).on('click', '.product-consume-button', function(e)
{
	e.preventDefault();

	Grocy.FrontendHelpers.BeginUiBusy();

	var productId = $(e.currentTarget).attr('data-product-id');
	var consumeAmount = Number.parseFloat($(e.currentTarget).attr('data-consume-amount'));
	var originalTotalStockAmount = Number.parseFloat($(e.currentTarget).attr('data-original-total-stock-amount'));
	var wasSpoiled = $(e.currentTarget).hasClass("product-consume-button-spoiled");

	Grocy.Api.Post('stock/products/' + productId + '/consume', { 'amount': consumeAmount, 'spoiled': wasSpoiled, 'allow_subproduct_substitution': true },
		function(bookingResponse)
		{
			Grocy.Api.Get('stock/products/' + productId,
				function(result)
				{
					if (result.product.enable_tare_weight_handling == 1)
					{
						var toastMessage = __t('Removed %1$s of %2$s from stock', originalTotalStockAmount.toLocaleString({ minimumFractionDigits: 0, maximumFractionDigits: Grocy.UserSettings.stock_decimal_places_amounts }) + " " + __n(consumeAmount, result.quantity_unit_stock.name, result.quantity_unit_stock.name_plural, true), result.product.name) + '<br><a class="btn btn-secondary btn-sm mt-2" href="#" onclick="UndoStockTransaction(\'' + bookingResponse[0].transaction_id + '\')"><i class="fa-solid fa-undo"></i> ' + __t("Undo") + '</a>';
					}
					else
					{
						var toastMessage = __t('Removed %1$s of %2$s from stock', consumeAmount.toLocaleString({ minimumFractionDigits: 0, maximumFractionDigits: Grocy.UserSettings.stock_decimal_places_amounts }) + " " + __n(consumeAmount, result.quantity_unit_stock.name, result.quantity_unit_stock.name_plural, true), result.product.name) + '<br><a class="btn btn-secondary btn-sm mt-2" href="#" onclick="UndoStockTransaction(\'' + bookingResponse[0].transaction_id + '\')"><i class="fa-solid fa-undo"></i> ' + __t("Undo") + '</a>';
					}

					if (wasSpoiled)
					{
						toastMessage += " (" + __t("Spoiled") + ")";
					}

					Grocy.FrontendHelpers.EndUiBusy();
					toastr.success(toastMessage);
					RefreshStatistics();
					RefreshProductRow(productId);
				},
				function(xhr)
				{
					Grocy.FrontendHelpers.EndUiBusy();
					console.error(xhr);
				}
			);
		},
		function(xhr)
		{
			Grocy.FrontendHelpers.EndUiBusy();
			console.error(xhr);
		}
	);
});

$(document).on('click', '.product-open-button', function(e)
{
	e.preventDefault();

	Grocy.FrontendHelpers.BeginUiBusy();

	var productId = $(e.currentTarget).attr('data-product-id');
	var productName = $(e.currentTarget).attr('data-product-name');
	var productQuName = $(e.currentTarget).attr('data-product-qu-name');
	var amount = Number.parseFloat($(e.currentTarget).attr('data-open-amount'));
	var button = $(e.currentTarget);

	Grocy.Api.Post('stock/products/' + productId + '/open', { 'amount': amount, 'allow_subproduct_substitution': true },
		function(bookingResponse)
		{
			Grocy.Api.Get('stock/products/' + productId,
				function(result)
				{
					if (result.stock_amount == result.stock_amount_opened)
					{
						button.addClass("disabled");
					}

					Grocy.FrontendHelpers.EndUiBusy();
					toastr.success(__t('Marked %1$s of %2$s as opened', amount.toLocaleString({ minimumFractionDigits: 0, maximumFractionDigits: Grocy.UserSettings.stock_decimal_places_amounts }) + " " + productQuName, productName) + '<br><a class="btn btn-secondary btn-sm mt-2" href="#" onclick="UndoStockTransaction(\'' + bookingResponse[0].transaction_id + '\')"><i class="fa-solid fa-undo"></i> ' + __t("Undo") + '</a>');

					if (result.product.move_on_open == 1 && result.default_consume_location != null)
					{
						toastr.info('<span>' + __t("Moved to %1$s", result.default_consume_location.name) + "</span> <i class='fa-solid fa-exchange-alt'></i>");
					}

					RefreshStatistics();
					RefreshProductRow(productId);
				},
				function(xhr)
				{
					Grocy.FrontendHelpers.EndUiBusy();
					console.error(xhr);
				}
			);
		},
		function(xhr)
		{
			Grocy.FrontendHelpers.EndUiBusy();
			console.error(xhr);
		}
	);
});

function RefreshStatistics()
{
	Grocy.Api.Get('stock',
		function(result)
		{
			if (!Grocy.FeatureFlags.GROCY_FEATURE_FLAG_STOCK_PRICE_TRACKING)
			{
				$("#info-current-stock").text(__n(result.filter(x => !BoolVal(x.product.hide_on_stock_overview)).length, '%s Product', '%s Products'));
			}
			else
			{
				var valueSum = 0;
				result.forEach(element =>
				{
					valueSum += element.value;
				});

				$("#info-current-stock").text(__n(result.filter(x => !BoolVal(x.product.hide_on_stock_overview)).length, '%s Product', '%s Products') + ", " + __t('%s total value', valueSum.toLocaleString(undefined, { style: "currency", currency: Grocy.Currency })));
			}
		},
		function(xhr)
		{
			console.error(xhr);
		}
	);

	var nextXDays = $("#info-duesoon-products").data("next-x-days");
	Grocy.Api.Get('stock/volatile?due_soon_days=' + nextXDays,
		function(result)
		{
			var dueProducts = result.due_products.filter(x => !BoolVal(x.product.hide_on_stock_overview));
			var overdueProducts = result.overdue_products.filter(x => !BoolVal(x.product.hide_on_stock_overview));
			var expiredProducts = result.expired_products.filter(x => !BoolVal(x.product.hide_on_stock_overview));
			var missingProducts = result.missing_products.filter(x => !BoolVal(x.product.hide_on_stock_overview));

			$("#info-duesoon-products").html('<span class="d-block d-md-none">' + dueProducts.length + ' <i class="fa-solid fa-clock"></i></span><span class="d-none d-md-block">' + __n(dueProducts.length, '%s product is due', '%s products are due') + ' ' + __n(nextXDays, 'within the next day', 'within the next %s days') + '</span>');
			$("#info-overdue-products").html('<span class="d-block d-md-none">' + overdueProducts.length + ' <i class="fa-solid fa-times-circle"></i></span><span class="d-none d-md-block">' + __n(overdueProducts.length, '%s product is overdue', '%s products are overdue') + '</span>');
			$("#info-expired-products").html('<span class="d-block d-md-none">' + expiredProducts.length + ' <i class="fa-solid fa-times-circle"></i></span><span class="d-none d-md-block">' + __n(expiredProducts.length, '%s product is expired', '%s products are expired') + '</span>');
			$("#info-missing-products").html('<span class="d-block d-md-none">' + missingProducts.length + ' <i class="fa-solid fa-exclamation-circle"></i></span><span class="d-none d-md-block">' + __n(missingProducts.length, '%s product is below defined min. stock amount', '%s products are below defined min. stock amount') + '</span>');
		},
		function(xhr)
		{
			console.error(xhr);
		}
	);
}
RefreshStatistics();

function RefreshProductRow(productId)
{
	productId = productId.toString();

	Grocy.Api.Get('stock/products/' + productId,
		function(result)
		{
			// Also refresh the parent product, if any
			if (result.product.parent_product_id)
			{
				RefreshProductRow(result.product.parent_product_id);
			}

			if (!result.next_due_date)
			{
				result.next_due_date = "2888-12-31"; // Unknown
			}

			var productRow = $('#product-' + productId + '-row');
			var dueSoonThreshold = moment().add($("#info-duesoon-products").data("next-x-days"), "days");
			var now = moment();
			var nextDueDate = moment(result.next_due_date);

			productRow.removeClass("table-warning");
			productRow.removeClass("table-danger");
			productRow.removeClass("table-secondary");
			productRow.removeClass("table-info");
			productRow.removeClass("d-none");
			productRow.removeAttr("style");
			if (now.isAfter(nextDueDate))
			{
				if (result.product.due_type == 1)
				{
					productRow.addClass("table-secondary");
				}
				else
				{
					productRow.addClass("table-danger");
				}
			}
			else if (nextDueDate.isBefore(dueSoonThreshold))
			{
				productRow.addClass("table-warning");
			}
			else if (result.product.min_stock_amount > 0 && result.stock_amount_aggregated < result.product.min_stock_amount)
			{
				productRow.addClass("table-info");
			}

			if (!BoolVal(Grocy.UserSettings.stock_overview_show_all_out_of_stock_products) && result.stock_amount == 0 && result.stock_amount_aggregated == 0 && result.product.min_stock_amount == 0)
			{
				animateCSS("#product-" + productId + "-row", "fadeOut", function()
				{
					$("#product-" + productId + "-row").addClass("d-none");
				});
			}
			else
			{
				animateCSS("#product-" + productId + "-row td:not(:first)", "flash");

				$('#product-' + productId + '-qu-name').text(__n(result.stock_amount, result.quantity_unit_stock.name, result.quantity_unit_stock.name_plural, true));
				$('#product-' + productId + '-amount').text(result.stock_amount);
				$('#product-' + productId + '-consume-all-button').attr('data-consume-amount', result.stock_amount);
				$('#product-' + productId + '-value').text(result.stock_value);
				$('#product-' + productId + '-next-due-date').text(result.next_due_date);
				$('#product-' + productId + '-next-due-date-timeago').attr('datetime', result.next_due_date);

				var openedAmount = result.stock_amount_opened || 0;
				if (openedAmount > 0)
				{
					$('#product-' + productId + '-opened-amount').text(__t('%s opened', openedAmount));
				}
				else
				{
					$('#product-' + productId + '-opened-amount').text("");
				}

				if (result.stock_amount_aggregated == 0)
				{
					$(".product-consume-button[data-product-id='" + productId + "']").addClass("disabled");
					$(".product-open-button[data-product-id='" + productId + "']").addClass("disabled");
				}
				else
				{
					$(".product-consume-button[data-product-id='" + productId + "']").removeClass("disabled");
					$(".product-open-button[data-product-id='" + productId + "']").removeClass("disabled");
				}

				if (result.product.disable_open == 1)
				{
					$(".product-open-button[data-product-id='" + productId + "']").addClass("disabled");
				}
			}

			$('#product-' + productId + '-next-due-date').text(result.next_due_date);
			$('#product-' + productId + '-next-due-date-timeago').attr('datetime', result.next_due_date + ' 23:59:59');

			if (result.stock_amount_opened > 0)
			{
				$('#product-' + productId + '-opened-amount').text(__t('%s opened', result.stock_amount_opened));
			}
			else
			{
				$('#product-' + productId + '-opened-amount').text("");
			}

			if (result.is_aggregated_amount == 1)
			{
				$('#product-' + productId + '-amount-aggregated').text(result.stock_amount_aggregated);

				if (result.stock_amount_opened_aggregated > 0)
				{
					$('#product-' + productId + '-opened-amount-aggregated').text(__t('%s opened', result.stock_amount_opened_aggregated));
				}
				else
				{
					$('#product-' + productId + '-opened-amount-aggregated').text("");
				}
			}

			// Needs to be delayed because of the animation above the date-text would be wrong if fired immediately...
			setTimeout(function()
			{
				RefreshContextualTimeago("#product-" + productId + "-row");
				RefreshLocaleNumberDisplay("#product-" + productId + "-row");
			}, Grocy.FormFocusDelay);
		},
		function(xhr)
		{
			Grocy.FrontendHelpers.EndUiBusy();
			console.error(xhr);
		}
	);
}

$(window).on("message", function(e)
{
	var data = e.originalEvent.data;

	if (data.Message === "ProductChanged")
	{
		RefreshProductRow(data.Payload);
		RefreshStatistics();
	}
});

$(document).on("Grocy.BarcodeScanned", function(e, barcode, target)
{
	if (target === "@stockoverview-search")
	{
		$("#search").val(barcode);
		stockOverviewTable.search(barcode).draw();
	}
});

if (typeof GetUriParam("product-group") !== "undefined")
{
	$("#product-group-filter").val(GetUriParam("product-group"));
	$("#product-group-filter").trigger("change");
}

if (typeof GetUriParam("productid") !== "undefined")
{
	var productId = GetUriParam("productid");
	Grocy.Components.ProductCard.Refresh(productId);
	$("#productcard-modal").modal("show");
}


function UpdateUriParam(key, value)
{
	var url = new URL(window.location);
	url.searchParams.set(key, value);
	window.history.pushState({}, "", url);
}

function RemoveUriParam(key)
{
	var url = new URL(window.location);
	url.searchParams.delete(key);
	window.history.pushState({}, "", url);
}

if (typeof Grocy.Components.ProductCard !== "undefined")
{
	var originalProductCardRefresh = Grocy.Components.ProductCard.Refresh;
	Grocy.Components.ProductCard.Refresh = function(productId)
	{
		UpdateUriParam("productid", productId);
		originalProductCardRefresh(productId);
	};
}

$("#productcard-modal").on("hide.bs.modal", function()
{
	RemoveUriParam("productid");
});
