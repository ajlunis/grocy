<?php require_frontend_packages(['datatables', 'animatecss']); ?>



<?php $__env->startSection('title', $__t('Stock overview')); ?>

<?php $__env->startPush('pageScripts'); ?>
<script src="<?php echo e($U('/viewjs/purchase.js?v=', true)); ?><?php echo e($version); ?>"></script>
<?php $__env->stopPush(); ?>

<?php $__env->startSection('content'); ?>
<div class="row">
	<div class="col">
		<div class="title-related-links">
			<h2 class="title mr-2 order-0">
				<?php echo $__env->yieldContent('title'); ?>
			</h2>
			<h2 class="mb-0 mr-auto order-3 order-md-1 width-xs-sm-100">
				<span id="info-current-stock"
					class="text-muted small"></span>
			</h2>
			<button class="btn btn-outline-dark d-md-none mt-2 float-right order-1 order-md-3"
				type="button"
				data-toggle="collapse"
				data-target="#related-links">
				<i class="fa-solid fa-ellipsis-v"></i>
			</button>
			<div class="related-links collapse d-md-flex order-2 width-xs-sm-100"
				id="related-links">
				<a class="btn btn-outline-dark responsive-button m-1 mt-md-0 mb-md-0 float-right"
					href="<?php echo e($U('/stockjournal')); ?>">
					<?php echo e($__t('Journal')); ?>

				</a>
				<a class="btn btn-outline-dark responsive-button m-1 mt-md-0 mb-md-0 float-right"
					href="<?php echo e($U('/stockentries')); ?>">
					<?php echo e($__t('Stock entries')); ?>

				</a>
				<?php if(GROCY_FEATURE_FLAG_STOCK_LOCATION_TRACKING || GROCY_FEATURE_FLAG_STOCK_PRICE_TRACKING): ?>
				<div class="dropdown">
					<a class="btn btn-outline-dark responsive-button m-1 mt-md-0 mb-md-0 float-right dropdown-toggle"
						href="#"
						data-toggle="dropdown">
						<?php echo e($__t('Reports')); ?>

					</a>
					<div class="dropdown-menu">
						<?php if(GROCY_FEATURE_FLAG_STOCK_LOCATION_TRACKING): ?>
						<a class="dropdown-item"
							href="<?php echo e($U('/locationcontentsheet')); ?>"><?php echo e($__t('Location Content Sheet')); ?></a>
						<?php endif; ?>
						<?php if(GROCY_FEATURE_FLAG_STOCK_PRICE_TRACKING): ?>
						<a class="dropdown-item"
							href="<?php echo e($U('/stockreports/spendings')); ?>"><?php echo e($__t('Spendings')); ?></a>
						<?php endif; ?>
					</div>
				</div>
				<?php endif; ?>
			</div>
		</div>
		<div class="border-top border-bottom my-2 py-1">
			<?php if(GROCY_FEATURE_FLAG_STOCK_BEST_BEFORE_DATE_TRACKING): ?>
			<div id="info-expired-products"
				data-status-filter="expired"
				class="error-message status-filter-message responsive-button mr-2"></div>
			<div id="info-overdue-products"
				data-status-filter="overdue"
				class="secondary-message status-filter-message responsive-button mr-2"></div>
			<div id="info-duesoon-products"
				data-next-x-days="<?php echo e($nextXDays); ?>"
				data-status-filter="duesoon"
				class="warning-message status-filter-message responsive-button mr-2"></div>
			<?php endif; ?>
			<div id="info-missing-products"
				data-status-filter="belowminstockamount"
				class="normal-message status-filter-message responsive-button"></div>
			<div class="float-right mt-1 <?php if($embedded): ?> pr-5 <?php endif; ?>">
				<a class="btn btn-sm btn-outline-info d-md-none"
					data-toggle="collapse"
					href="#table-filter-row"
					role="button">
					<i class="fa-solid fa-filter"></i>
				</a>
				<button id="clear-filter-button"
					class="btn btn-sm btn-outline-info"
					data-toggle="tooltip"
					title="<?php echo e($__t('Clear filter')); ?>">
					<i class="fa-solid fa-filter-circle-xmark"></i>
				</button>
			</div>
		</div>
	</div>
</div>
<div class="row collapse d-md-flex"
	id="table-filter-row">
	<div class="col-12 col-md-6 col-xl-3">
		<div class="input-group">
			<div class="input-group-prepend">
				<span class="input-group-text"><i class="fa-solid fa-search"></i></span>
			</div>
			<input type="text"
				id="search"
				class="form-control"
				placeholder="<?php echo e($__t('Search')); ?>">
		</div>
	</div>
	<?php if(GROCY_FEATURE_FLAG_STOCK_LOCATION_TRACKING): ?>
	<div class="col-12 col-md-6 col-xl-3">
		<div class="input-group">
			<div class="input-group-prepend">
				<span class="input-group-text"><i class="fa-solid fa-filter"></i>&nbsp;<?php echo e($__t('Location')); ?></span>
			</div>
			<select class="custom-control custom-select"
				id="location-filter">
				<option value="all"><?php echo e($__t('All')); ?></option>
				<?php $__currentLoopData = $locations; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $location): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
				<option value="<?php echo e($location->name); ?>"><?php echo e($location->name); ?></option>
				<?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
			</select>
		</div>
	</div>
	<?php endif; ?>
	<div class="col-12 col-md-6 col-xl-3">
		<div class="input-group">
			<div class="input-group-prepend">
				<span class="input-group-text"><i class="fa-solid fa-filter"></i>&nbsp;<?php echo e($__t('Product group')); ?></span>
			</div>
			<select class="custom-control custom-select"
				id="product-group-filter">
				<option value="all"><?php echo e($__t('All')); ?></option>
				<?php $__currentLoopData = $productGroups; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $productGroup): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
				<option value="<?php echo e($productGroup->name); ?>"><?php echo e($productGroup->name); ?></option>
				<?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
			</select>
		</div>
	</div>
	<div class="col-12 col-md-6 col-xl-3">
		<div class="input-group">
			<div class="input-group-prepend">
				<span class="input-group-text"><i class="fa-solid fa-filter"></i>&nbsp;<?php echo e($__t('Status')); ?></span>
			</div>
			<select class="custom-control custom-select"
				id="status-filter">
				<option class="bg-white"
					value="all"><?php echo e($__t('All')); ?></option>
				<?php if(GROCY_FEATURE_FLAG_STOCK_BEST_BEFORE_DATE_TRACKING): ?>
				<option value="duesoon"><?php echo e($__t('Due soon')); ?></option>
				<option value="overdue"><?php echo e($__t('Overdue')); ?></option>
				<option value="expired"><?php echo e($__t('Expired')); ?></option>
				<?php endif; ?>
				<option value="belowminstockamount"><?php echo e($__t('Below min. stock amount')); ?></option>
				<option value="instockX"><?php echo e($__t('In stock products')); ?></option>
			</select>
		</div>
	</div>
</div>

<div class="row">
	<div class="col">
		<table id="stock-overview-table"
			class="table table-sm table-striped nowrap w-100">
			<thead>
				<tr>
					<th class="border-right"><a class="text-muted change-table-columns-visibility-button"
							data-toggle="tooltip"
							title="<?php echo e($__t('Table options')); ?>"
							data-table-selector="#stock-overview-table"
							href="#"><i class="fa-solid fa-eye"></i></a>
					</th>
					<th><?php echo e($__t('Product')); ?></th>
					<th class="allow-grouping"><?php echo e($__t('Product group')); ?></th>
					<th><?php echo e($__t('Amount')); ?></th>
					<th class="<?php if(!GROCY_FEATURE_FLAG_STOCK_PRICE_TRACKING): ?> d-none <?php endif; ?>"><?php echo e($__t('Value')); ?></th>
					<th class="<?php if(!GROCY_FEATURE_FLAG_STOCK_BEST_BEFORE_DATE_TRACKING): ?> d-none <?php endif; ?> allow-grouping"><?php echo e($__t('Next due date')); ?></th>
					<th class="d-none">Hidden location</th>
					<th class="d-none">Hidden status</th>
					<th class="d-none">Hidden product group</th>
					<th><?php echo e($__t('Calories')); ?> (<?php echo e($__t('Per stock quantity unit')); ?>)</th>
					<th><?php echo e($__t('Calories')); ?></th>
					<th class="allow-grouping"><?php echo e($__t('Last purchased')); ?></th>
					<th class="<?php if(!GROCY_FEATURE_FLAG_STOCK_PRICE_TRACKING): ?> d-none <?php endif; ?>"><?php echo e($__t('Last price')); ?></th>
					<th class="allow-grouping"><?php echo e($__t('Min. stock amount')); ?></th>
					<th><?php echo e($__t('Product description')); ?></th>
					<th class="allow-grouping"><?php echo e($__t('Parent product')); ?></th>
					<th class="allow-grouping"><?php echo e($__t('Default location')); ?></th>
					<th><?php echo e($__t('Product picture')); ?></th>
					<th class="<?php if(!GROCY_FEATURE_FLAG_STOCK_PRICE_TRACKING): ?> d-none <?php endif; ?>"><?php echo e($__t('Average price')); ?></th>
					<th class="<?php if(!GROCY_FEATURE_FLAG_STOCK_PRICE_TRACKING): ?> d-none <?php endif; ?> allow-grouping"><?php echo e($__t('Default store')); ?></th>

					<?php echo $__env->make('components.userfields_thead', array(
					'userfields' => $userfields
					), array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>

				</tr>
			</thead>
			<tbody class="d-none">
				<?php $__currentLoopData = $currentStock; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $currentStockEntry): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
				<tr id="product-<?php echo e($currentStockEntry->product_id); ?>-row"
					class="<?php if(GROCY_FEATURE_FLAG_STOCK_BEST_BEFORE_DATE_TRACKING && $currentStockEntry->best_before_date < date('Y-m-d 23:59:59', strtotime('-1 days')) && $currentStockEntry->amount > 0): ?> <?php if($currentStockEntry->due_type == 1): ?> table-secondary <?php else: ?> table-danger <?php endif; ?> <?php elseif(GROCY_FEATURE_FLAG_STOCK_BEST_BEFORE_DATE_TRACKING && $currentStockEntry->best_before_date < date('Y-m-d 23:59:59', strtotime('+' . $nextXDays . ' days')) && $currentStockEntry->amount > 0): ?> table-warning <?php elseif($currentStockEntry->product_missing): ?> table-info <?php endif; ?>">
					<td class="fit-content border-right">
						<a class="permission-STOCK_CONSUME btn btn-success btn-sm product-consume-button <?php if($currentStockEntry->amount_aggregated < $currentStockEntry->quick_consume_amount || $currentStockEntry->enable_tare_weight_handling == 1): ?> disabled <?php endif; ?>"
							href="#"
							data-toggle="tooltip"
							data-placement="left"
							title="<?php echo e($__t('Consume %1$s of %2$s', $currentStockEntry->quick_consume_amount_qu_consume . ' ' . $currentStockEntry->qu_consume_name, $currentStockEntry->product_name)); ?>"
							data-product-id="<?php echo e($currentStockEntry->product_id); ?>"
							data-product-name="<?php echo e($currentStockEntry->product_name); ?>"
							data-product-qu-name="<?php echo e($currentStockEntry->qu_stock_name); ?>"
							data-consume-amount="<?php echo e($currentStockEntry->quick_consume_amount); ?>">
							<i class="fa-solid fa-utensils"></i> <span class="locale-number locale-number-quantity-amount"><?php echo e($currentStockEntry->quick_consume_amount_qu_consume); ?></span>
						</a>
						<a id="product-<?php echo e($currentStockEntry->product_id); ?>-consume-all-button"
							class="permission-STOCK_CONSUME btn btn-danger btn-sm product-consume-button <?php if($currentStockEntry->amount_aggregated == 0): ?> disabled <?php endif; ?>"
							href="#"
							data-toggle="tooltip"
							data-placement="right"
							title="<?php echo e($__t('Consume all %s which are currently in stock', $currentStockEntry->product_name)); ?>"
							data-product-id="<?php echo e($currentStockEntry->product_id); ?>"
							data-product-name="<?php echo e($currentStockEntry->product_name); ?>"
							data-product-qu-name="<?php echo e($currentStockEntry->qu_stock_name); ?>"
							data-consume-amount="<?php if($currentStockEntry->enable_tare_weight_handling == 1): ?><?php echo e($currentStockEntry->tare_weight); ?><?php else: ?><?php echo e($currentStockEntry->amount); ?><?php endif; ?>"
							data-original-total-stock-amount="<?php echo e($currentStockEntry->amount); ?>">
							<i class="fa-solid fa-utensils"></i> <?php echo e($__t('All')); ?>

						</a>
						<?php if(GROCY_FEATURE_FLAG_STOCK_PRODUCT_OPENED_TRACKING): ?>
						<a class="btn btn-success btn-sm product-open-button <?php if($currentStockEntry->amount_aggregated < $currentStockEntry->quick_open_amount || $currentStockEntry->amount_aggregated == $currentStockEntry->amount_opened_aggregated || $currentStockEntry->enable_tare_weight_handling == 1 || $currentStockEntry->disable_open == 1): ?> disabled <?php endif; ?>"
							href="#"
							data-toggle="tooltip"
							data-placement="left"
							title="<?php echo e($__t('Mark %1$s of %2$s as open', $currentStockEntry->quick_open_amount_qu_consume . ' ' . $currentStockEntry->qu_consume_name, $currentStockEntry->product_name)); ?>"
							data-product-id="<?php echo e($currentStockEntry->product_id); ?>"
							data-product-name="<?php echo e($currentStockEntry->product_name); ?>"
							data-product-qu-name="<?php echo e($currentStockEntry->qu_stock_name); ?>"
							data-open-amount="<?php echo e($currentStockEntry->quick_open_amount); ?>">
							<i class="fa-solid fa-box-open"></i> <span class="locale-number locale-number-quantity-amount"><?php echo e($currentStockEntry->quick_open_amount_qu_consume); ?></span>
						</a>
						<?php endif; ?>
						<div class="dropdown d-inline-block">
							<button class="btn btn-sm btn-light text-secondary"
								type="button"
								data-toggle="dropdown">
								<i class="fa-solid fa-ellipsis-v"></i>
							</button>
							<div class="table-inline-menu dropdown-menu dropdown-menu-right">
								<?php if(GROCY_FEATURE_FLAG_SHOPPINGLIST): ?>
								<a class="dropdown-item show-as-dialog-link permission-SHOPPINGLIST_ITEMS_ADD"
									type="button"
									href="<?php echo e($U('/shoppinglistitem/new?embedded&updateexistingproduct&list=1&product=' . $currentStockEntry->product_id )); ?>">
									<span class="dropdown-item-icon"><i class="fa-solid fa-shopping-cart"></i></span> <span class="dropdown-item-text"><?php echo e($__t('Add to shopping list')); ?></span>
								</a>
								<div class="dropdown-divider"></div>
								<?php endif; ?>
								<a class="dropdown-item show-as-dialog-link permission-STOCK_PURCHASE"
									type="button"
									href="<?php echo e($U('/purchase?embedded&product=' . $currentStockEntry->product_id )); ?>">
									<span class="dropdown-item-icon"><i class="fa-solid fa-cart-plus"></i></span> <span class="dropdown-item-text"><?php echo e($__t('Purchase')); ?></span>
								</a>
								<a class="dropdown-item show-as-dialog-link permission-STOCK_CONSUME <?php if($currentStockEntry->amount_aggregated <= 0): ?> disabled <?php endif; ?>"
									type="button"
									href="<?php echo e($U('/consume?embedded&product=' . $currentStockEntry->product_id )); ?>">
									<span class="dropdown-item-icon"><i class="fa-solid fa-utensils"></i></span> <span class="dropdown-item-text"><?php echo e($__t('Consume')); ?></span>
								</a>
								<?php if(GROCY_FEATURE_FLAG_STOCK_LOCATION_TRACKING): ?>
								<a class="dropdown-item show-as-dialog-link permission-STOCK_TRANSFER <?php if($currentStockEntry->amount <= 0): ?> disabled <?php endif; ?>"
									type="button"
									href="<?php echo e($U('/transfer?embedded&product=' . $currentStockEntry->product_id)); ?>">
									<span class="dropdown-item-icon"><i class="fa-solid fa-exchange-alt"></i></span> <span class="dropdown-item-text"><?php echo e($__t('Transfer')); ?></span>
								</a>
								<?php endif; ?>
								<a class="dropdown-item show-as-dialog-link permission-STOCK_INVENTORY"
									type="button"
									href="<?php echo e($U('/inventory?embedded&product=' . $currentStockEntry->product_id )); ?>">
									<span class="dropdown-item-icon"><i class="fa-solid fa-list"></i></span> <span class="dropdown-item-text"><?php echo e($__t('Inventory')); ?></span>
								</a>
								<?php if(GROCY_FEATURE_FLAG_RECIPES): ?>
								<div class="dropdown-divider"></div>
								<a class="dropdown-item"
									type="button"
									href="<?php echo e($U('/recipes?search=')); ?><?php echo e($currentStockEntry->product_name); ?>">
									<span class="dropdown-item-text"><?php echo e($__t('Search for recipes containing this product')); ?></span>
								</a>
								<?php endif; ?>
								<div class="dropdown-divider"></div>
								<a class="dropdown-item productcard-trigger"
									data-product-id="<?php echo e($currentStockEntry->product_id); ?>"
									type="button"
									href="#">
									<span class="dropdown-item-text"><?php echo e($__t('Product overview')); ?></span>
								</a>
								<a class="dropdown-item show-as-dialog-link"
									type="button"
									href="<?php echo e($U('/stockentries?embedded&product=')); ?><?php echo e($currentStockEntry->product_id); ?>"
									data-dialog-type="table"
									data-product-id="<?php echo e($currentStockEntry->product_id); ?>">
									<span class="dropdown-item-text"><?php echo e($__t('Stock entries')); ?></span>
								</a>
								<a class="dropdown-item show-as-dialog-link"
									type="button"
									href="<?php echo e($U('/stockjournal?embedded&product=')); ?><?php echo e($currentStockEntry->product_id); ?>"
									data-dialog-type="table">
									<span class="dropdown-item-text"><?php echo e($__t('Stock journal')); ?></span>
								</a>
								<a class="dropdown-item show-as-dialog-link"
									type="button"
									href="<?php echo e($U('/stockjournal/summary?embedded&product_id=')); ?><?php echo e($currentStockEntry->product_id); ?>"
									data-dialog-type="table">
									<span class="dropdown-item-text"><?php echo e($__t('Stock journal summary')); ?></span>
								</a>
								<a class="dropdown-item permission-MASTER_DATA_EDIT link-return"
									type="button"
									data-href="<?php echo e($U('/product/')); ?><?php echo e($currentStockEntry->product_id); ?>">
									<span class="dropdown-item-text"><?php echo e($__t('Edit product')); ?></span>
								</a>
								<div class="dropdown-divider"></div>
								<a class="dropdown-item"
									type="button"
									href="<?php echo e($U('/product/' . $currentStockEntry->product_id . '/grocycode?download=true')); ?>">
									<?php echo str_replace('Grocycode', '<span class="ls-n1">Grocycode</span>', $__t('Download %s Grocycode', $__t('Product'))); ?>

								</a>
								<?php if(GROCY_FEATURE_FLAG_LABEL_PRINTER): ?>
								<a class="dropdown-item product-grocycode-label-print"
									data-product-id="<?php echo e($currentStockEntry->product_id); ?>"
									type="button"
									href="#">
									<?php echo str_replace('Grocycode', '<span class="ls-n1">Grocycode</span>', $__t('Print %s Grocycode on label printer', $__t('Product'))); ?>

								</a>
								<?php endif; ?>
							</div>
						</div>
					</td>
					<td class="productcard-trigger cursor-link"
						data-product-id="<?php echo e($currentStockEntry->product_id); ?>">
						<?php echo e($currentStockEntry->product_name); ?>

						<span class="d-none"><?php echo e($currentStockEntry->product_barcodes); ?></span>
					</td>
					<td>
						<?php if($currentStockEntry->product_group_name !== null): ?><?php echo e($currentStockEntry->product_group_name); ?><?php endif; ?>
					</td>
					<td>
						<span class="custom-sort d-none"><?php if($currentStockEntry->product_no_own_stock == 1): ?><?php echo e($currentStockEntry->amount_aggregated); ?><?php else: ?><?php echo e($currentStockEntry->amount); ?><?php endif; ?></span>
						<span class="<?php if($currentStockEntry->product_no_own_stock == 1): ?> d-none <?php endif; ?>">
							<span id="product-<?php echo e($currentStockEntry->product_id); ?>-amount"
								class="locale-number locale-number-quantity-amount"><?php echo e($currentStockEntry->amount); ?></span> <span id="product-<?php echo e($currentStockEntry->product_id); ?>-qu-name"><?php echo e($__n($currentStockEntry->amount, $currentStockEntry->qu_stock_name, $currentStockEntry->qu_stock_name_plural)); ?></span>
							<span id="product-<?php echo e($currentStockEntry->product_id); ?>-opened-amount"
								class="small font-italic"><?php if($currentStockEntry->amount_opened > 0): ?><?php echo e($__t('%s opened', $currentStockEntry->amount_opened)); ?><?php endif; ?></span>
						</span>
						<?php if($currentStockEntry->is_aggregated_amount == 1): ?>
						<span class="<?php if($currentStockEntry->product_no_own_stock == 0): ?> pl-1 <?php endif; ?> text-secondary">
							<i class="fa-solid fa-custom-sigma-sign"></i> <span id="product-<?php echo e($currentStockEntry->product_id); ?>-amount-aggregated"
								class="locale-number locale-number-quantity-amount"><?php echo e($currentStockEntry->amount_aggregated); ?></span> <?php echo e($__n($currentStockEntry->amount_aggregated, $currentStockEntry->qu_stock_name, $currentStockEntry->qu_stock_name_plural, true)); ?>

							<?php if($currentStockEntry->amount_opened_aggregated > 0): ?>
							<span id="product-<?php echo e($currentStockEntry->product_id); ?>-opened-amount-aggregated"
								class="small font-italic">
								<?php echo $__t('%s opened', '<span class="locale-number locale-number-quantity-amount">' . $currentStockEntry->amount_opened_aggregated . '</span>'); ?>

							</span>
							<?php endif; ?>
						</span>
						<?php endif; ?>
						<?php if(boolval($userSettings['show_icon_on_stock_overview_page_when_product_is_on_shopping_list'])): ?>
						<?php if($currentStockEntry->on_shopping_list): ?>
						<span class="text-muted cursor-normal"
							data-toggle="tooltip"
							title="<?php echo e($__t('This product is currently on a shopping list')); ?>">
							<i class="fa-solid fa-shopping-cart"></i>
						</span>
						<?php endif; ?>
						<?php endif; ?>
					</td>
					<td>
						<span class="custom-sort d-none"><?php echo e($currentStockEntry->value); ?></span>
						<span id="product-<?php echo e($currentStockEntry->product_id); ?>-value"
							class="locale-number locale-number-currency"><?php echo e($currentStockEntry->value); ?></span>
					</td>
					<td class="<?php if(!GROCY_FEATURE_FLAG_STOCK_BEST_BEFORE_DATE_TRACKING): ?> d-none <?php endif; ?>">
						<span id="product-<?php echo e($currentStockEntry->product_id); ?>-next-due-date"><?php echo e($currentStockEntry->best_before_date); ?></span>
						<time id="product-<?php echo e($currentStockEntry->product_id); ?>-next-due-date-timeago"
							class="timeago timeago-contextual"
							<?php if(!empty($currentStockEntry->best_before_date)): ?> datetime="<?php echo e($currentStockEntry->best_before_date); ?> 23:59:59" <?php endif; ?>></time>
					</td>
					<td class="d-none">
						<?php $__currentLoopData = FindAllObjectsInArrayByPropertyValue($currentStockLocations, 'product_id', $currentStockEntry->product_id); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $locationsForProduct): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
						xx<?php echo e(FindObjectInArrayByPropertyValue($locations, 'id', $locationsForProduct->location_id)->name); ?>xx
						<?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
					</td>
					<td class="d-none">
						<?php if($currentStockEntry->best_before_date < date('Y-m-d
							23:59:59',
							strtotime('-'
							. '1'
							. ' days'
							))
							&&
							$currentStockEntry->amount > 0): ?> <?php if($currentStockEntry->due_type == 1): ?> overdue <?php else: ?> expired <?php endif; ?> <?php elseif($currentStockEntry->best_before_date < date('Y-m-d
								23:59:59',
								strtotime('+'
								.
								$nextXDays
								. ' days'
								))
								&&
								$currentStockEntry->amount > 0): ?> duesoon <?php endif; ?>
								<?php if($currentStockEntry->amount_aggregated > 0): ?> instockX <?php endif; ?>
								<?php if($currentStockEntry->product_missing): ?> belowminstockamount <?php endif; ?>
					</td>
					<td class="d-none">
						xx<?php echo e($currentStockEntry->product_group_name); ?>xx
					</td>
					<td>
						<span class="locale-number locale-number-quantity-amount"><?php echo e($currentStockEntry->product_calories); ?></span>
					</td>
					<td>
						<span class="locale-number locale-number-quantity-amount"><?php echo e($currentStockEntry->calories); ?></span>
					</td>
					<td>
						<?php echo e($currentStockEntry->last_purchased); ?>

						<time class="timeago timeago-contextual"
							datetime="<?php echo e($currentStockEntry->last_purchased); ?>"></time>
					</td>
					<td class="<?php if(!GROCY_FEATURE_FLAG_STOCK_PRICE_TRACKING): ?> d-none <?php endif; ?>">
						<span class="custom-sort d-none"><?php echo e($currentStockEntry->last_price); ?></span>
						<?php if(!empty($currentStockEntry->last_price)): ?>
						<span data-toggle="tooltip"
							data-trigger="hover click"
							data-html="true"
							title="<?php echo $__t('%1$s per %2$s', '<span class=\'locale-number locale-number-currency\'>' . $currentStockEntry->last_price . '</span>', $currentStockEntry->qu_stock_name); ?>">
							<?php echo $__t('%1$s per %2$s', '<span class="locale-number locale-number-currency">' . $currentStockEntry->last_price * $currentStockEntry->product_qu_factor_price_to_stock . '</span>', $currentStockEntry->qu_price_name); ?>

						</span>
						<?php endif; ?>
					</td>
					<td>
						<span class="locale-number locale-number-quantity-amount"><?php echo e($currentStockEntry->min_stock_amount); ?></span>
					</td>
					<td>
						<?php echo $currentStockEntry->product_description; ?>

					</td>
					<td class="productcard-trigger cursor-link"
						data-product-id="<?php echo e($currentStockEntry->parent_product_id); ?>">
						<?php echo e($currentStockEntry->parent_product_name); ?>

					</td>
					<td>
						<?php echo e($currentStockEntry->product_default_location_name); ?>

					</td>
					<td>
						<?php if(!empty($currentStockEntry->product_picture_file_name)): ?>
						<img src="<?php echo e($U('/api/files/productpictures/' . base64_encode($currentStockEntry->product_picture_file_name) . '?force_serve_as=picture&best_fit_width=64&best_fit_height=64')); ?>"
							loading="lazy">
						<?php endif; ?>
					</td>
					<td class="<?php if(!GROCY_FEATURE_FLAG_STOCK_PRICE_TRACKING): ?> d-none <?php endif; ?>">
						<span class="custom-sort d-none"><?php echo e($currentStockEntry->average_price); ?></span>
						<?php if(!empty($currentStockEntry->average_price)): ?>
						<span data-toggle="tooltip"
							data-trigger="hover click"
							data-html="true"
							title="<?php echo $__t('%1$s per %2$s', '<span class=\'locale-number locale-number-currency\'>' . $currentStockEntry->average_price . '</span>', $currentStockEntry->qu_stock_name); ?>">
							<?php echo $__t('%1$s per %2$s', '<span class="locale-number locale-number-currency">' . $currentStockEntry->average_price * $currentStockEntry->product_qu_factor_price_to_stock . '</span>', $currentStockEntry->qu_price_name); ?>

						</span>
						<?php endif; ?>
					</td>
					<td>
						<?php if($currentStockEntry->default_store_name !== null): ?><?php echo e($currentStockEntry->default_store_name); ?><?php endif; ?>
					</td>

					<?php echo $__env->make('components.userfields_tbody', array(
					'userfields' => $userfields,
					'userfieldValues' => FindAllObjectsInArrayByPropertyValue($userfieldValues, 'object_id', $currentStockEntry->product_id)
					), array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>

				</tr>
				<?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
			</tbody>
		</table>
	</div>
</div>

<?php echo $__env->make('components.productcard', [
'asModal' => true
], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layout.default', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH /app/views/stockoverview.blade.php ENDPATH**/ ?>