

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

$(".status-filter-message").on("click", function()
{
	var value = $(this).data("status-filter");

	// Add the filter if it doesn't exist
	if (typeof StockFilters !== 'undefined') {
		StockFilters.addFilter('filter-hidden-status');

		// Wait for UI to render
		setTimeout(function() {
			var filter = StockFilters.filters.find(f => f.id === 'filter-hidden-status');
			if(filter) {
				filter.element.selectpicker('val', value);
			}
		}, 50);
	}
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
			}
			else
			{
				$(".product-consume-button[data-product-id='" + productId + "']").removeClass("disabled");
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

// Filter URI params are handled in stockoverview_filters.js

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
