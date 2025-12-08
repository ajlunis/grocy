
/*
 * Stock Overview Filters Logic
 * Encapsulates the complex filtering logic including dynamic userfield filters
 */

class StockOverviewFilters {
    constructor(table) {
        this.table = table;
        this.filters = [];
        this.availableFilters = [];

        this.init();
    }

    init() {
        this.initBootstrapSelects();
        this.loadAvailableFilters();

        this.convertExistingFilter('#location-filter', 'hidden-location', 'multiselect', __t('Location'));
        this.convertExistingFilter('#product-group-filter', 'hidden-product-group', 'multiselect', __t('Product group'));
        this.convertExistingFilter('#status-filter', 'hidden-status', 'multiselect', __t('Status'));

        this.handleUrlParams();

        this.initAddFilterButton();
        this.initClearFilterButton();

        this.setupDataTableSearch();
    }

    handleUrlParams() {
        if (typeof GetUriParam("product-group") !== "undefined") {
            $("#product-group-filter").selectpicker('val', GetUriParam("product-group"));
        }
        if (typeof GetUriParam("location") !== "undefined") {
            $("#location-filter").selectpicker('val', GetUriParam("location"));
        }
        if (typeof GetUriParam("status") !== "undefined") {
            $("#status-filter").selectpicker('val', GetUriParam("status"));
        }
    }

    initBootstrapSelects() {
        $.fn.selectpicker.Constructor.DEFAULTS.liveSearch = true;
        $.fn.selectpicker.Constructor.DEFAULTS.actionsBox = true;
        $.fn.selectpicker.Constructor.DEFAULTS.virtualScroll = 600;
        $.fn.selectpicker.Constructor.DEFAULTS.container = 'body';
        $.fn.selectpicker.Constructor.DEFAULTS.style = 'btn-light';
        $.fn.selectpicker.Constructor.DEFAULTS.showTick = true;

        $('.selectpicker').selectpicker();
    }

    initClearFilterButton() {
        var self = this;
        $("#clear-filter-button").off('click').on("click", function()
        {
            $("#search").val("");

            for (var i = self.filters.length - 1; i >= 0; i--) {
                var filter = self.filters[i];
                if (filter.isPermanent) {
                    filter.element.selectpicker('val', 'all');
                } else {
                    self.removeFilter(filter.id);
                }
            }

            self.table.search("").draw();
        });
    }

    setupDataTableSearch() {
        var self = this;
        $.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
            for (var i = 0; i < self.filters.length; i++) {
                var filter = self.filters[i];
                if (!self.checkFilter(filter, settings, dataIndex)) {
                    return false;
                }
            }
            return true;
        });
    }

    checkFilter(filter, settings, dataIndex) {
        var cell = settings.aoData[dataIndex].anCells[filter.columnIndex];
        var rawValue = $(cell).find('.custom-sort').text();
        if(!rawValue) rawValue = $(cell).find('.userfield-raw-value').text();
        if (!rawValue) rawValue = $(cell).text();

        rawValue = rawValue ? rawValue.trim() : "";

        if (filter.type === 'multiselect' || filter.type === 'userfield-multiselect') {
            return this.checkMultiselect(filter, rawValue);
        } else if (filter.type === 'number' || filter.type === 'number-currency') {
            return this.checkNumber(filter, rawValue);
        } else if (filter.type === 'date' || filter.type === 'datetime') {
            return this.checkDate(filter, rawValue);
        } else if (filter.type === 'checkbox') {
            return this.checkCheckbox(filter, rawValue);
        } else if (filter.type === 'set-not-set') {
             return this.checkSetNotSet(filter, rawValue);
        }

        return true;
    }

    checkMultiselect(filter, rawValue) {
        var selectedValues = filter.element.val();
        if (!selectedValues || selectedValues.length === 0) {
             return false;
        }

        var logic = filter.element.closest('.input-group').find('input[name="logic-' + filter.id + '"]:checked').val();
        if (!logic) logic = 'OR';

        if (filter.type === 'multiselect')
        {
             for(var i=0; i<selectedValues.length; i++) {
                 var val = selectedValues[i];
                 if (val === 'all') return true;

                 if (val === '__grocy_not_set__') {
                     if (!rawValue || rawValue === "") return true;
                     continue;
                 }

                 var matchVal = "xx" + val + "xx";
                 if (rawValue.indexOf(matchVal) !== -1) return true;
                 if (rawValue === val) return true;
            }
            return false;
        }
        else
        {
            var rowValues = rawValue.split(',').map(function(item) { return item.trim(); });
            if (selectedValues.includes('all')) return true;

            var notSetSelected = selectedValues.includes('__grocy_not_set__');
            var isRowEmpty = (rawValue === "" || (rowValues.length === 1 && rowValues[0] === ""));

            if (logic === 'OR') {
                 if (notSetSelected && isRowEmpty) return true;

                 for(var i=0; i<selectedValues.length; i++) {
                     if (rowValues.includes(selectedValues[i])) return true;
                 }
                 return false;
            } else if (logic === 'AND') {
                 var exact = filter.element.closest('.filter-container').find('.exact-match-checkbox').is(':checked');

                 if (notSetSelected && !isRowEmpty) return false;

                 for(var i=0; i<selectedValues.length; i++) {
                     if (selectedValues[i] === '__grocy_not_set__') continue;
                     if (!rowValues.includes(selectedValues[i])) return false;
                 }

                 if (exact) {
                     if (rowValues.length !== selectedValues.length) return false;
                 }

                 return true;
            }
        }
        return true;
    }

    checkNumber(filter, rawValue) {
        var container = filter.element.closest('.filter-container');
        var operator = container.find('.filter-operator').val();
        var valueInput = container.find('.filter-value').val();
        var value = parseFloat(valueInput);

        var cellValue = parseFloat(rawValue);
        if (isNaN(cellValue)) cellValue = 0;

        if (isNaN(value)) return true;

        if (operator === '=') return cellValue === value;
        if (operator === '<') return cellValue < value;
        if (operator === '>') return cellValue > value;

        return true;
    }

    checkDate(filter, rawValue) {
         var container = filter.element.closest('.filter-container');
         var operator = container.find('.filter-operator').val();
         var valueStr = container.find('.filter-value').val(); // This gets value from input

         if (operator === 'empty') return !rawValue || rawValue === "";

         if (!valueStr) return true;

         // rawValue is expected to be ISO string YYYY-MM-DD HH:mm:ss or YYYY-MM-DD
         var cellDate = moment(rawValue);
         var filterDate = moment(valueStr); // format depends on locale, but moment handles it if standard

         // If using TempusDominus, the input value is localized string.
         // We should rely on moment parsing it correctly using locale.

         if (!cellDate.isValid()) return false;
         if (!filterDate.isValid()) return true;

         if (operator === 'on') return cellDate.isSame(filterDate, 'day'); // Precision Day for 'On'
         if (operator === 'before') return cellDate.isBefore(filterDate); // Precision Millisecond
         if (operator === 'after') return cellDate.isAfter(filterDate);

         return true;
    }

    checkCheckbox(filter, rawValue) {
        var val = filter.element.val();
        if (val === 'all') return true;

        var boolVal = (rawValue == "1");

        if (val === 'checked') return boolVal;
        if (val === 'unchecked') return !boolVal;
        if (val === 'not-set') return !rawValue;

        return true;
    }

    checkSetNotSet(filter, rawValue) {
        var val = filter.element.val();
        if (val === 'all') return true;

        if (val === 'set') return (rawValue && rawValue.length > 0);
        if (val === 'not-set') return (!rawValue || rawValue.length === 0);

        return true;
    }

    convertExistingFilter(selector, columnName, type, caption) {
        var element = $(selector);
        var columnIndex = this.getColumnIndexByName(columnName);

        if (columnName !== 'hidden-location' && element.find('option[value="__grocy_not_set__"]').length === 0) {
             element.find('option[value="all"]').after('<option value="__grocy_not_set__">' + __t('Not set') + '</option>');
        }

        element.off('change');
        // Fix: Remove custom-select and hide original
        element.removeClass('custom-select').addClass('selectpicker d-none').attr('multiple', 'multiple').selectpicker('render');
        element.selectpicker('refresh');

        var filterObj = {
            id: 'filter-' + columnName,
            element: element,
            columnIndex: columnIndex,
            type: type,
            caption: caption,
            isPermanent: true
        };

        this.filters.push(filterObj);

        var self = this;
        element.on('changed.bs.select', function() {
            self.table.draw();
        });
    }

    getColumnIndexByName(name) {
        var index = -1;
        $('#stock-overview-table thead th').each(function(i) {
            if ($(this).data('filter-name') === name) {
                index = i;
                return false;
            }
        });
        return index;
    }

    loadAvailableFilters() {
         this.addAvailableFilter('amount', __t('Amount'), 'number', 3);
         this.addAvailableFilter('value', __t('Value'), 'number-currency', 4);
         this.addAvailableFilter('calories', __t('Calories'), 'number', 10);
         this.addAvailableFilter('last-purchased', __t('Last purchased'), 'date', 11);
         this.addAvailableFilter('last-price', __t('Last price'), 'number-currency', 12);
         this.addAvailableFilter('min-stock', __t('Min. stock amount'), 'number', 13);
         this.addAvailableFilter('average-price', __t('Average price'), 'number-currency', 18);
         this.addAvailableFilter('default-location', __t('Default location'), 'multiselect-dynamic', 16);
         this.addAvailableFilter('default-store', __t('Default store'), 'multiselect-dynamic', 19);

         var self = this;
         $('#stock-overview-table thead th[data-userfield-name]').each(function(i, th) {
             var name = $(th).data('userfield-name');
             var type = $(th).data('userfield-type');
             var caption = $(th).text();

             self.availableFilters.push({
                 id: 'userfield-' + name,
                 caption: caption,
                 type: self.mapUserfieldTypeToFilterType(type),
                 columnIndex: self.table.column(th).index(),
                 isUserfield: true,
                 origType: type
             });
         });
    }

    addAvailableFilter(id, caption, type, colIndex) {
        this.availableFilters.push({
            id: id,
            caption: caption,
            type: type,
            columnIndex: colIndex,
            isUserfield: false
        });
    }

    mapUserfieldTypeToFilterType(ufType) {
        if (ufType === 'checkbox') return 'checkbox';
        if (ufType === 'date') return 'date';
        if (ufType === 'datetime') return 'datetime';
        if (ufType === 'number-currency') return 'number-currency';
        if (ufType.startsWith('number')) return 'number';
        if (ufType === 'link' || ufType === 'file' || ufType === 'image') return 'set-not-set';
        if (ufType === 'preset-list' || ufType === 'preset-checklist') return 'userfield-multiselect';
        return 'set-not-set';
    }

    initAddFilterButton() {
        var container = $('<div class="col-12 col-md-6 col-xl-3" id="add-filter-container"></div>');
        var group = $('<div class="input-group"></div>');
        var prepend = $('<div class="input-group-prepend"><span class="input-group-text"><i class="fa-solid fa-plus"></i>&nbsp;' + __t('Add filter') + '</span></div>');

        // Remove custom-control and d-none, rely on selectpicker()
        var select = $('<select class="selectpicker" data-live-search="true"></select>');
        select.append('<option value="">' + __t('Select a filter to add') + '</option>');

        var stdGroup = $('<optgroup label="' + __t('Standard') + '"></optgroup>');
        var ufGroup = $('<optgroup label="' + __t('Userfields') + '"></optgroup>');

        this.availableFilters.forEach(function(f) {
            var opt = $('<option></option>').val(f.id).text(f.caption);
            if (f.isUserfield) ufGroup.append(opt);
            else stdGroup.append(opt);
        });

        select.append(stdGroup);
        if(ufGroup.children().length > 0) select.append(ufGroup);

        group.append(prepend);
        group.append(select);
        container.append(group);

        $('#table-filter-row').append(container);

        // Explicitly initialize
        select.selectpicker();

        var self = this;
        select.on('changed.bs.select', function() {
            var val = $(this).val();
            if (val) {
                 self.addFilter(val);
                 // Reset value and refresh
                 $(this).val('');
                 $(this).selectpicker('refresh');
            }
        });
    }

    addFilter(filterId) {
        var filterDef = this.availableFilters.find(f => f.id === filterId);
        if (!filterDef) return;

        if (this.filters.find(f => f.id === filterId)) return;

        var container = $('<div class="col-12 col-md-6 col-xl-3 filter-container mb-2" id="container-' + filterId + '"></div>');
        var group = $('<div class="input-group"></div>');

        var removeBtn = $('<div class="input-group-prepend"><button class="btn btn-outline-danger" type="button"><i class="fa-solid fa-trash"></i></button></div>');
        removeBtn.find('button').on('click', () => this.removeFilter(filterId));
        group.append(removeBtn);

        group.append('<div class="input-group-prepend"><span class="input-group-text">' + filterDef.caption + '</span></div>');

        var element;

        if (filterDef.type === 'number' || filterDef.type === 'number-currency') {
            element = this.createNumberFilterUI(group, filterDef);
        } else if (filterDef.type === 'date' || filterDef.type === 'datetime') {
            element = this.createDateFilterUI(group, filterDef);
        } else if (filterDef.type === 'checkbox') {
            element = this.createCheckboxFilterUI(group);
        } else if (filterDef.type === 'set-not-set') {
            element = this.createSetNotSetFilterUI(group);
        } else if (filterDef.type === 'multiselect-dynamic' || filterDef.type === 'userfield-multiselect') {
            element = this.createMultiselectDynamicUI(group, filterDef, container.attr('id'));
        }

        container.append(group);

        $('#add-filter-container').before(container);

        // Initialize any selectpickers in the new container
        container.find('.selectpicker').selectpicker();

        var filterObj = {
            id: filterId,
            element: element,
            columnIndex: filterDef.columnIndex,
            type: filterDef.type,
            caption: filterDef.caption,
            isPermanent: false
        };

        this.filters.push(filterObj);

        var self = this;
        // Bind change events including click for +/- buttons
        container.find('input, select').on('change changed.bs.select keyup', function() {
            self.table.draw();
        });

        // Special bindings for +/- buttons which are appended to group
        container.find('.number-btn').on('click', function() {
            // Logic handled in createNumberFilterUI event bindings,
            // but we need to trigger draw here if value changed
            // The createNumberFilterUI buttons trigger 'change' on input?
        });
    }

    removeFilter(filterId) {
        var index = this.filters.findIndex(f => f.id === filterId);
        if (index > -1) {
            $('#container-' + filterId).remove();

            this.filters.splice(index, 1);
            this.table.draw();
        }
    }

    createNumberFilterUI(group, filterDef) {
        if (filterDef.type === 'number-currency') {
            group.append('<div class="input-group-prepend"><span class="input-group-text">' + Grocy.Currency + '</span></div>');
        }

        var opSelect = $('<select class="custom-control custom-select filter-operator flex-grow-0" style="width: 60px;">' +
            '<option value="=">=</option>' +
            '<option value="<">&lt;</option>' +
            '<option value=">">&gt;</option>' +
            '</select>');

        var minusBtn = $('<div class="input-group-prepend"><button class="btn btn-secondary number-btn" type="button"><i class="fa-solid fa-minus"></i></button></div>');
        var input = $('<input type="number" class="form-control filter-value" step="0.01">');
        var plusBtn = $('<div class="input-group-append"><button class="btn btn-secondary number-btn" type="button"><i class="fa-solid fa-plus"></i></button></div>');

        group.append(opSelect);
        group.append(minusBtn);
        group.append(input);
        group.append(plusBtn);

        // Button Logic
        minusBtn.find('button').on('click', function() {
            var val = parseFloat(input.val());
            if (isNaN(val)) val = 0;
            input.val(val - 1).trigger('change');
        });
        plusBtn.find('button').on('click', function() {
            var val = parseFloat(input.val());
            if (isNaN(val)) val = 0;
            input.val(val + 1).trigger('change');
        });

        return group;
    }

    createDateFilterUI(group, filterDef) {
        var opSelect = $('<select class="custom-control custom-select filter-operator flex-grow-0" style="width: 100px;">' +
            '<option value="on">' + __t('On') + '</option>' +
            '<option value="before">' + __t('Before') + '</option>' +
            '<option value="after">' + __t('After') + '</option>' +
            '<option value="empty">' + __t('Not set') + '</option>' +
            '</select>');

        var input = $('<input type="text" class="form-control filter-value datetimepicker-input" data-toggle="datetimepicker">');

        opSelect.on('change', function() {
            if ($(this).val() === 'empty') {
                input.prop('disabled', true);
            } else {
                input.prop('disabled', false);
            }
        });

        // Presets Dropdown
        var presetsBtn = $('<div class="input-group-append">' +
            '<button class="btn btn-outline-secondary dropdown-toggle" type="button" data-toggle="dropdown">' + __t('Presets') + '</button>' +
            '<div class="dropdown-menu dropdown-menu-right">' +
            '<a class="dropdown-item preset-link" href="#" data-range="week">' + __t('In the last week') + '</a>' +
            '<a class="dropdown-item preset-link" href="#" data-range="month">' + __t('In the last month') + '</a>' +
            '<a class="dropdown-item preset-link" href="#" data-range="year">' + __t('In the last year') + '</a>' +
            '<div class="dropdown-divider"></div>' +
            '<a class="dropdown-item preset-link" href="#" data-range="year-plus">' + __t('Over a year ago') + '</a>' +
            '</div></div>');

        group.append(opSelect);
        group.append(input);
        group.append(presetsBtn);

        // Initialize TempusDominus
        var format = 'L';
        if (filterDef.type === 'datetime') format = 'L LT';

        input.datetimepicker({
            format: format,
            buttons: {
                showToday: true,
                showClose: true
            },
            calendarWeeks: Grocy.CalendarShowWeekNumbers,
            locale: moment.locale(),
            useCurrent: false,
            icons: {
                time: 'fa-solid fa-clock',
                date: 'fa-solid fa-calendar',
                up: 'fa-solid fa-arrow-up',
                down: 'fa-solid fa-arrow-down',
                previous: 'fa-solid fa-chevron-left',
                next: 'fa-solid fa-chevron-right',
                today: 'fa-solid fa-calendar-day',
                clear: 'fa-solid fa-trash-can',
                close: 'fa-solid fa-check'
            }
        });

        // Fix for TempusDominus not triggering 'change' on input when selected via widget
        input.on('change.datetimepicker', function(e) {
            // Trigger actual change event for the filter logic
            // But we need to update the internal value or rely on .val()
            // .val() works on the input.
            // Just ensure table draw logic picks it up.
            self.table.draw();
        });

        // Preset Logic
        presetsBtn.find('.preset-link').on('click', function(e) {
            e.preventDefault();
            var range = $(this).data('range');
            var now = moment();

            if (range === 'week') {
                opSelect.val('after');
                input.val(now.subtract(1, 'week').format(format));
            } else if (range === 'month') {
                opSelect.val('after');
                input.val(now.subtract(1, 'month').format(format));
            } else if (range === 'year') {
                opSelect.val('after');
                input.val(now.subtract(1, 'year').format(format));
            } else if (range === 'year-plus') {
                opSelect.val('before');
                input.val(now.subtract(1, 'year').format(format));
            }

            self.table.draw();
        });

        return group;
    }

    createCheckboxFilterUI(group) {
        var select = $('<select class="custom-control custom-select selectpicker">' +
            '<option value="all">' + __t('All') + '</option>' +
            '<option value="checked">' + __t('Checked') + '</option>' +
            '<option value="unchecked">' + __t('Unchecked') + '</option>' +
            '</select>');
        group.append(select);
        return select;
    }

    createSetNotSetFilterUI(group) {
        var select = $('<select class="custom-control custom-select selectpicker">' +
            '<option value="all">' + __t('All') + '</option>' +
            '<option value="set">' + __t('Set') + '</option>' +
            '<option value="not-set">' + __t('Not set') + '</option>' +
            '</select>');
        group.append(select);
        return select;
    }

    createMultiselectDynamicUI(group, filterDef, containerId) {
        var select = $('<select class="custom-control custom-select selectpicker d-none" multiple data-actions-box="true"></select>');

        var uniqueValues = new Set();
        var hasEmptyValues = false;
        var colData = this.table.column(filterDef.columnIndex).data();

        colData.each(function(val, index) {
            var temp = document.createElement('div');
            temp.innerHTML = val;
            var text = temp.textContent.trim();

            if (!text) hasEmptyValues = true;

            if (filterDef.type === 'userfield-multiselect') {
                 if (text) {
                     text.split(',').forEach(v => uniqueValues.add(v.trim()));
                 }
            } else {
                 if (text) uniqueValues.add(text);
            }
        });

        select.append($('<option></option>').val('__grocy_not_set__').text(__t('Not set')));

        if (hasEmptyValues) {
             select.append($('<option data-divider="true"></option>'));
        }

        Array.from(uniqueValues).sort().forEach(v => {
            if(v) select.append($('<option></option>').val(v).text(v));
        });

        select.selectpicker('val', []);
        select.selectpicker('selectAll');

        group.append(select);

        if (filterDef.type === 'userfield-multiselect') {
             var logicDiv = $('<div class="input-group-append pl-2 pt-2"></div>');
             var name = 'logic-' + filterDef.id;
             logicDiv.append('<div class="form-check form-check-inline"><input class="form-check-input" type="radio" name="' + name + '" value="OR" checked><label class="form-check-label">OR</label></div>');
             logicDiv.append('<div class="form-check form-check-inline"><input class="form-check-input" type="radio" name="' + name + '" value="AND"><label class="form-check-label">AND</label></div>');

             var exactDiv = $('<div class="form-check form-check-inline exact-match-container" style="display:none;"><input class="form-check-input exact-match-checkbox" type="checkbox"><label class="form-check-label">' + __t('Exact match') + '</label></div>');

             logicDiv.append(exactDiv);
             group.after(logicDiv);

             logicDiv.find('input[type="radio"]').on('change', function() {
                 if ($(this).val() === 'AND') exactDiv.show();
                 else exactDiv.hide();

                 // Trigger filter update
                 self.table.draw();
             });

             exactDiv.find('input').on('change', function() {
                 self.table.draw();
             });
        }

        return select;
    }
}

var StockFilters;
$(document).ready(function() {
    if (typeof stockOverviewTable !== 'undefined') {
        StockFilters = new StockOverviewFilters(stockOverviewTable);
    }
});
