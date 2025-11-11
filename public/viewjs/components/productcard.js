
Grocy.Components.ProductCard = {};

Grocy.Components.ProductCard.Refresh = function(productId, modal)
{
	Grocy.Api.Get('stock/products/' + productId,
		function(productDetails)
		{
			var stockAmount = productDetails.stock_amount || '0';
			var stockValue = productDetails.stock_value || '0';
			if (isNaN(parseFloat(stockValue))) {
				stockValue = '0';
			}
			var stockAmountOpened = productDetails.stock_amount_opened || '0';
			modal.find('#productcard-product-name').text(productDetails.product.name);

			if (productDetails.product.parent_product_id) {
				Grocy.Api.Get('objects/products/' + productDetails.product.parent_product_id, function(parentProduct) {
					modal.find('#productcard-parent-product-name').html('<strong>' + __t('Parent product') + ':</strong> <a href="#" class="productcard-trigger" data-product-id="' + parentProduct.id + '">' + parentProduct.name + '</a>').addClass('mb-2').find('a').addClass('text-primary');
				});
			} else {
				modal.find('#productcard-parent-product-name').html('').removeClass('mb-2');
			}

			modal.find('#productcard-product-description').html(productDetails.product.description);

			if (productDetails.product_group) {
				modal.find('#productcard-product-group').text(productDetails.product_group.name);
				modal.find('#productcard-product-group').parent().removeClass('d-none');
			} else {
				modal.find('#productcard-product-group').text('');
				modal.find('#productcard-product-group').parent().addClass('d-none');
			}

			modal.find('#productcard-product-stock-amount').text(stockAmount);
			modal.find('#productcard-product-stock-qu-name').text(__n(stockAmount, productDetails.quantity_unit_stock.name, productDetails.quantity_unit_stock.name_plural, true));
			modal.find('#productcard-product-stock-value').text(stockValue);
			modal.find('#productcard-product-last-purchased').text((productDetails.last_purchased || '2999-12-31').substring(0, 10));
			modal.find('#productcard-product-last-purchased-timeago').attr("datetime", productDetails.last_purchased || '2999-12-31');
			modal.find('#productcard-product-last-used').text((productDetails.last_used || '2999-12-31').substring(0, 10));
			modal.find('#productcard-product-last-used-timeago').attr("datetime", productDetails.last_used || '2999-12-31');
			if (productDetails.location != null)
			{
				modal.find('#productcard-product-location').text(productDetails.location.name);
			}

			if (productDetails.is_aggregated_amount == 1)
			{
				modal.find('#productcard-product-stock-amount-aggregated').text(productDetails.stock_amount_aggregated);
				modal.find('#productcard-product-stock-qu-name-aggregated').text(__n(productDetails.stock_amount_aggregated, productDetails.quantity_unit_stock.name, productDetails.quantity_unit_stock.name_plural, true));

				if (productDetails.stock_amount_opened_aggregated > 0)
				{
					modal.find('#productcard-product-stock-opened-amount-aggregated').text(__t('%s opened', productDetails.stock_amount_opened_aggregated.toLocaleString({ minimumFractionDigits: 0, maximumFractionDigits: Grocy.UserSettings.stock_decimal_places_amounts })));
				}
				else
				{
					modal.find('#productcard-product-stock-opened-amount-aggregated').text("");
				}

				modal.find("#productcard-aggregated-amounts").removeClass("d-none");
			}
			else
			{
				modal.find("#productcard-aggregated-amounts").addClass("d-none");
			}

			if (productDetails.product.description)
			{
				modal.find("#productcard-product-description-wrapper").removeClass("d-none");
			}
			else
			{
				modal.find("#productcard-product-description-wrapper").addClass("d-none");
			}

			if (productDetails.average_shelf_life_days == -1)
			{
				modal.find('#productcard-product-average-shelf-life').text(__t("Unknown"));
			}
			else if (productDetails.average_shelf_life_days > 73000) // > 200 years aka forever
			{
				modal.find('#productcard-product-average-shelf-life').text(__t("Unlimited"));
			}
			else
			{
				modal.find('#productcard-product-average-shelf-life').text(moment.duration(productDetails.average_shelf_life_days, "days").humanize());
			}

			if (stockAmountOpened > 0)
			{
				modal.find('#productcard-product-stock-opened-amount').text(__t('%s opened', stockAmountOpened.toLocaleString({ minimumFractionDigits: 0, maximumFractionDigits: Grocy.UserSettings.stock_decimal_places_amounts })));
			}
			else
			{
				modal.find('#productcard-product-stock-opened-amount').text("");
			}

			modal.find('#productcard-product-edit-button').attr("href", U("/product/" + productDetails.product.id.toString() + '?' + 'returnto=' + encodeURIComponent(Grocy.CurrentUrlRelative)));
			modal.find('#productcard-product-journal-button').attr("href", U("/stockjournal?embedded&product=" + productDetails.product.id.toString()));
			modal.find('#productcard-product-shoppinglist-button').attr("href", U("/shoppinglistitem/new?embedded&updateexistingproduct&list=1&product=" + productDetails.product.id.toString()));
			modal.find('#productcard-product-stock-button').attr("href", U("/stockentries?embedded&product=" + productDetails.product.id.toString()));
			modal.find('#productcard-product-stock-button').removeClass("disabled");
			modal.find('#productcard-product-edit-button').removeClass("disabled");
			modal.find('#productcard-product-journal-button').removeClass("disabled");
			modal.find('#productcard-product-shoppinglist-button').removeClass("disabled");

			if (productDetails.last_price !== null)
			{
				modal.find('#productcard-product-last-price').text(__t("%1$s per %2$s", (productDetails.last_price * productDetails.qu_conversion_factor_price_to_stock).toLocaleString(undefined, { style: "currency", currency: Grocy.Currency, minimumFractionDigits: Grocy.UserSettings.stock_decimal_places_prices_display, maximumFractionDigits: Grocy.UserSettings.stock_decimal_places_prices_display }), productDetails.quantity_unit_price.name));
				modal.find('#productcard-product-last-price').attr("data-original-title", __t("%1$s per %2$s", productDetails.last_price.toLocaleString(undefined, { style: "currency", currency: Grocy.Currency, minimumFractionDigits: Grocy.UserSettings.stock_decimal_places_prices_display, maximumFractionDigits: Grocy.UserSettings.stock_decimal_places_prices_display }), productDetails.quantity_unit_stock.name));
			}
			else
			{
				modal.find('#productcard-product-last-price').text(__t('Unknown'));
				modal.find('#productcard-product-last-price').removeAttr("data-original-title");
			}

			if (productDetails.avg_price !== null)
			{
				modal.find('#productcard-product-average-price').text(__t("%1$s per %2$s", (productDetails.avg_price * productDetails.qu_conversion_factor_price_to_stock).toLocaleString(undefined, { style: "currency", currency: Grocy.Currency, minimumFractionDigits: Grocy.UserSettings.stock_decimal_places_prices_display, maximumFractionDigits: Grocy.UserSettings.stock_decimal_places_prices_display }), productDetails.quantity_unit_price.name));
				modal.find('#productcard-product-average-price').attr("data-original-title", __t("%1$s per %2$s", productDetails.avg_price.toLocaleString(undefined, { style: "currency", currency: Grocy.Currency, minimumFractionDigits: Grocy.UserSettings.stock_decimal_places_prices_display, maximumFractionDigits: Grocy.UserSettings.stock_decimal_places_prices_display }), productDetails.quantity_unit_stock.name));
			}
			else
			{
				modal.find('#productcard-product-average-price').text(__t('Unknown'));
				$().removeAttr("data-original-title");
			}

			if (productDetails.product.picture_file_name)
			{
				modal.find("#productcard-product-picture").removeClass("d-none");
				modal.find("#productcard-product-picture").attr("src", U('/api/files/productpictures/' + btoa(productDetails.product.picture_file_name) + '?force_serve_as=picture&best_fit_width=400'));
			}
			else
			{
				modal.find("#productcard-product-picture").addClass("d-none");
			}

			// Grocycode
			modal.find('#productcard-grocycode-img').html('<img src="' + U('/product/' + productDetails.product.id + '/grocycode?size=60') + '">');
			modal.find('#productcard-grocycode-buttons').html('<a class="btn btn-outline-primary btn-sm" href="' + U('/product/' + productDetails.product.id + '/grocycode?download=true') + '">' + __t('Download') + '</a>' +
				'<a class="btn btn-outline-primary btn-sm ml-1 product-grocycode-label-print" data-product-id="' + productDetails.product.id + '" href="#">' + __t('Print on label printer') + '</a>');

			// Barcodes
			var barcodes = productDetails.product_barcodes;
			var barcodeHtml = '';
			if (barcodes && barcodes.length > 0) {
				barcodeHtml += '<div class="mt-3"><strong>' + __t('Barcodes') + ':</strong><ul class="list-unstyled">';
				barcodes.forEach(function(barcode) {
					barcodeHtml += '<li>' + barcode.barcode + '</li>';
				});
				barcodeHtml += '</ul></div>';
			}
			modal.find('#productcard-barcodes').html(barcodeHtml);

			// Userfields
			var userfields = productDetails.userfields;
			var userfieldsHtml = '';
			if (userfields) {
				userfieldsHtml += '<div class="mt-3"><strong>' + __t('Userfields') + ':</strong><dl class="row">';
				Object.keys(userfields).forEach(function(key) {
					var userfield = userfields[key];
					if (userfield.value) {
						userfieldsHtml += '<dt class="col-sm-3">' + userfield.caption + '</dt><dd class="col-sm-9">';
						switch (userfield.type) {
							case 'checkbox':
								userfieldsHtml += userfield.value == 1 ? __t('Yes') : __t('No');
								break;
							case 'date':
								userfieldsHtml += moment(userfield.value).format('YYYY-MM-DD');
								break;
							case 'datetime':
								userfieldsHtml += moment(userfield.value).format('YYYY-MM-DD HH:mm:ss');
								break;
							case 'number-integral':
								userfieldsHtml += Number.parseInt(userfield.value).toLocaleString();
								break;
							case 'number-decimal':
								userfieldsHtml += Number.parseFloat(userfield.value).toLocaleString();
								break;
							case 'number-currency':
								userfieldsHtml += Number.parseFloat(userfield.value).toLocaleString(undefined, { style: "currency", currency: Grocy.Currency });
								break;
							case 'file':
							case 'image':
								userfieldsHtml += '<a href="' + U('/api/files/userfiles/' + btoa(userfield.value)) + '" target="_blank">' + userfield.value.substring(userfield.value.indexOf('_') + 1) + '</a>';
								break;
							case 'link':
								userfieldsHtml += '<a href="' + userfield.value + '" target="_blank">' + userfield.value + '</a>';
								break;
							case 'link-with-title':
								var link = JSON.parse(userfield.value);
								userfieldsHtml += '<a href="' + link.url + '" target="_blank">' + link.title + '</a>';
								break;
							default:
								userfieldsHtml += userfield.value;
						}
						userfieldsHtml += '</dd>';
					}
				});
				userfieldsHtml += '</dl></div>';
			}
			modal.find('#productcard-userfields-wrapper').html(userfieldsHtml);


			modal.find("#productcard-product-stock-amount-wrapper").removeClass("d-none");
			modal.find("#productcard-aggregated-amounts").addClass("pl-2");
			if (productDetails.product.no_own_stock == 1)
			{
				modal.find("#productcard-product-stock-amount-wrapper").addClass("d-none");
				modal.find("#productcard-aggregated-amounts").removeClass("pl-2");
			}

			RefreshContextualTimeago(".productcard");
			RefreshLocaleNumberDisplay(".productcard");

			if (Grocy.FeatureFlags.GROCY_FEATURE_FLAG_STOCK_PRICE_TRACKING)
			{
				Grocy.Api.Get('stock/products/' + productId + '/price-history',
					function(priceHistoryDataPoints)
					{
						if (priceHistoryDataPoints.length > 0)
						{
							modal.find("#productcard-product-price-history-chart").removeClass("d-none");
							modal.find("#productcard-no-price-data-hint").addClass("d-none");

							Grocy.Components.ProductCard.ReInitPriceHistoryChart();

							var datasets = {};
							datasets["_TrendlineDataset"] = []

							var chart = Grocy.Components.ProductCard.PriceHistoryChart.data;
							priceHistoryDataPoints.forEach((dataPoint) =>
							{
								var key = __t("Unknown store");
								if (dataPoint.shopping_location)
								{
									key = dataPoint.shopping_location.name
								}

								if (!datasets[key])
								{
									datasets[key] = []
								}

								chart.labels.push(moment(dataPoint.date).toDate());
								datasets[key].push({ x: moment(dataPoint.date).toDate(), y: dataPoint.price * productDetails.qu_conversion_factor_price_to_stock });
								datasets["_TrendlineDataset"].push({ x: moment(dataPoint.date).toDate(), y: dataPoint.price * productDetails.qu_conversion_factor_price_to_stock });
							});

							Object.keys(datasets).forEach((key) =>
							{
								if (key != "_TrendlineDataset")
								{
									var color = "HSL(" + (129 * chart.datasets.length) + ",100%,50%)";

									chart.datasets.push({
										data: datasets[key],
										label: key,
										fill: false,
										borderColor: color,
										pointBackgroundColor: color,
										pointBorderColor: color,
										pointHoverBackgroundColor: color
									});
								}
								else
								{
									chart.datasets.push({
										data: datasets[key],
										fill: false,
										borderColor: "HSL(" + (129 * chart.datasets.length) + ",100%,50%)",
										label: key,
										hidden: true,
										alwaysShowTrendline: true,
										trendlineLinear: {
											colorMin: "rgba(0, 0, 0, 0.3)",
											colorMax: "rgba(0, 0, 0, 0.3)",
											lineStyle: "dotted",
											width: 3
										}
									});
								}

							});

							Grocy.Components.ProductCard.PriceHistoryChart.update();
						}
						else
						{
							modal.find("#productcard-product-price-history-chart").addClass("d-none");
							modal.find("#productcard-no-price-data-hint").removeClass("d-none");
						}
					},
					function(xhr)
					{
						console.error(xhr);
					}
				);
			}
		},
		function(xhr)
		{
			console.error(xhr);
		}
	);
};

Grocy.Components.ProductCard.ReInitPriceHistoryChart = function()
{
	if (typeof Grocy.Components.ProductCard.PriceHistoryChart !== "undefined")
	{
		Grocy.Components.ProductCard.PriceHistoryChart.destroy();
	}

	var format = 'YYYY-MM-DD';
	Grocy.Components.ProductCard.PriceHistoryChart = new Chart(document.getElementById("productcard-product-price-history-chart"), {
		type: "line",
		data: {
			labels: [ //Date objects
				// Will be populated in Grocy.Components.ProductCard.Refresh
			],
			datasets: [ //Datasets
				// Will be populated in Grocy.Components.ProductCard.Refresh
			]
		},
		options: {
			scales: {
				xAxes: [{
					type: 'time',
					time: {
						parser: format,
						round: 'day',
						tooltipFormat: format,
						unit: 'day',
						unitStepSize: 10,
						displayFormats: {
							'day': format
						}
					},
					ticks: {
						autoSkip: true,
						maxRotation: 0
					}
				}],
				yAxes: [{
					ticks: {
						beginAtZero: true,
						callback: function(value, index, ticks)
						{
							return Number.parseFloat(value).toLocaleString(undefined, { style: "currency", currency: Grocy.Currency, minimumFractionDigits: Grocy.UserSettings.stock_decimal_places_prices_display, maximumFractionDigits: Grocy.UserSettings.stock_decimal_places_prices_display });
						}
					}
				}]
			},
			legend: {
				display: true,
				labels: {
					filter: function(item, chart)
					{
						return item.text != "_TrendlineDataset";
					}
				}
			},
			tooltips: {
				callbacks: {
					label: function(tooltipItem, data)
					{
						var label = data.datasets[tooltipItem.datasetIndex].label || '';

						if (label)
						{
							label += ': ';
						}

						label += tooltipItem.yLabel.toLocaleString(undefined, { style: "currency", currency: Grocy.Currency, minimumFractionDigits: Grocy.UserSettings.stock_decimal_places_prices_display, maximumFractionDigits: Grocy.UserSettings.stock_decimal_places_prices_display })
						return label;
					}
				}
			}
		}
	});
}

$("#productcard-product-description").on("shown.bs.collapse", function()
{
	$(".expandable-text").find("a[data-toggle='collapse']").text(__t("Show less"));
})

$("#productcard-product-description").on("hidden.bs.collapse", function()
{
	$(".expandable-text").find("a[data-toggle='collapse']").text(__t("Show more"));
})

$(document).on("click", ".productcard-trigger", function(e)
{
    e.preventDefault();
    e.stopPropagation();

    var productId = $(e.currentTarget).attr("data-product-id");
    if (productId)
    {
        var modal = $("#productcard-modal");
        var targetModal;

        // If a product card modal is already shown,
        // we clone it to stack them
        if (modal.hasClass("show") || $(".productcard-modal-sub").length > 0)
        {
            targetModal = modal.clone()
                .addClass("productcard-modal-sub")
                .attr("id", "productcard-modal-" + productId)
                .appendTo("body");

            targetModal.on('hidden.bs.modal', function (e) {
                $('body').addClass('modal-open');
                $(e.currentTarget).remove();
            });
        }
        else
        {
            targetModal = modal;
        }

        Grocy.Components.ProductCard.Refresh(productId, targetModal);
        targetModal.modal("show");
    }
});

$(document).on('shown.bs.modal', '.show-as-dialog-link', function(e) {
	var modal = $(e.currentTarget);
	modal.on('hidden.bs.modal', function (e) {
		$('body').addClass('modal-open');
	});
});


$(document).on('click', '.product-grocycode-label-print', function(e)
{
	e.preventDefault();
	var productId = $(e.currentTarget).attr('data-product-id');
	Grocy.Api.Get('stock/products/' + productId + '/printlabel', function(labelData) {
		// Nothing to do, is a fire and forget request
	});
});
