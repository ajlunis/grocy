<?php require_frontend_packages(['datatables']); ?>



<?php $__env->startSection('title', $__t('Products')); ?>

<?php $__env->startSection('content'); ?>
<div class="row">
	<div class="col">
		<div class="title-related-links">
			<h2 class="title"><?php echo $__env->yieldContent('title'); ?></h2>
			<div class="float-right <?php if($embedded): ?> pr-5 <?php endif; ?>">
				<button class="btn btn-outline-dark d-md-none mt-2 order-1 order-md-3"
					type="button"
					data-toggle="collapse"
					data-target="#table-filter-row">
					<i class="fa-solid fa-filter"></i>
				</button>
				<button class="btn btn-outline-dark d-md-none mt-2 order-1 order-md-3"
					type="button"
					data-toggle="collapse"
					data-target="#related-links">
					<i class="fa-solid fa-ellipsis-v"></i>
				</button>
			</div>
			<div class="related-links collapse d-md-flex order-2 width-xs-sm-100"
				id="related-links">
				<a class="btn btn-primary responsive-button m-1 mt-md-0 mb-md-0 float-right"
					href="<?php echo e($U('/product/new')); ?>">
					<?php echo e($__t('Add')); ?>

				</a>
				<a class="btn btn-outline-secondary m-1 mt-md-0 mb-md-0 float-right"
					href="<?php echo e($U('/userfields?entity=products')); ?>">
					<?php echo e($__t('Configure userfields')); ?>

				</a>
				<a class="btn btn-outline-secondary m-1 mt-md-0 mb-md-0 float-right"
					href="<?php echo e($U('/stocksettings#productpresets')); ?>">
					<?php echo e($__t('Presets for new products')); ?>

				</a>
			</div>
		</div>
	</div>
</div>

<hr class="my-2">

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
	<div class="col-12 col-md-6 col-xl-3">
		<div class="input-group">
			<div class="input-group-prepend">
				<span class="input-group-text"><i class="fa-solid fa-filter"></i>&nbsp;<?php echo e($__t('Product group')); ?></span>
			</div>
			<select class="custom-control custom-select"
				id="product-group-filter">
				<option value="all"><?php echo e($__t('All')); ?></option>
				<?php $__currentLoopData = $productGroups; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $productGroup): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
				<option value="<?php echo e($productGroup->id); ?>"><?php echo e($productGroup->name); ?></option>
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
				<option value="all"><?php echo e($__t('All')); ?></option>
				<option value="in-stock"><?php echo e($__t('In stock products')); ?></option>
				<option value="out-of-stock"><?php echo e($__t('Out of stock products')); ?></option>
			</select>
		</div>
	</div>
	<div class="col-12 col-md-6 col-xl-2">
		<div class="form-check custom-control custom-checkbox">
			<input class="form-check-input custom-control-input"
				type="checkbox"
				id="show-disabled">
			<label class="form-check-label custom-control-label"
				for="show-disabled">
				<?php echo e($__t('Show disabled')); ?>

			</label>
		</div>
	</div>
	<div class="col">
		<div class="float-right">
			<button id="clear-filter-button"
				class="btn btn-sm btn-outline-info"
				data-toggle="tooltip"
				title="<?php echo e($__t('Clear filter')); ?>">
				<i class="fa-solid fa-filter-circle-xmark"></i>
			</button>
		</div>
	</div>
</div>

<div class="row">
	<div class="col">
		<table id="products-table"
			class="table table-sm table-striped nowrap w-100">
			<thead>
				<tr>
					<th class="border-right"><a class="text-muted change-table-columns-visibility-button"
							data-toggle="tooltip"
							title="<?php echo e($__t('Table options')); ?>"
							data-table-selector="#products-table"
							href="#"><i class="fa-solid fa-eye"></i></a>
					</th>
					<th><?php echo e($__t('Name')); ?></th>
					<th class="<?php if(!GROCY_FEATURE_FLAG_STOCK_LOCATION_TRACKING): ?> d-none <?php endif; ?> allow-grouping"><?php echo e($__t('Location')); ?></th>
					<th class="allow-grouping"><?php echo e($__t('Min. stock amount')); ?></th>
					<th class=""><?php echo e($__t('Default quantity unit purchase')); ?></th>
					<th class="allow-grouping"><?php echo e($__t('Quantity unit stock')); ?></th>
					<th class=""><?php echo e($__t('Product group')); ?></th>
					<th class="<?php if(!GROCY_FEATURE_FLAG_STOCK_PRICE_TRACKING): ?> d-none <?php endif; ?> allow-grouping"><?php echo e($__t('Default store')); ?></th>
					<th class=""><?php echo e($__t('Grocycode')); ?></th>
					<th><?php echo e($__t('Product picture')); ?></th>

					<?php echo $__env->make('components.userfields_thead', array(
					'userfields' => $userfields
					), array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>

				</tr>
			</thead>
			<tbody class="d-none">
				<?php $__currentLoopData = $products; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $product): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
				<tr class="<?php if($product->active == 0): ?> text-muted <?php endif; ?>">
					<td class="fit-content border-right">
						<a class="btn btn-info btn-sm"
							href="<?php echo e($U('/product/')); ?><?php echo e($product->id); ?>"
							data-toggle="tooltip"
							title="<?php echo e($__t('Edit this item')); ?>">
							<i class="fa-solid fa-edit"></i>
						</a>
						<a class="btn btn-danger btn-sm product-delete-button"
							href="#"
							data-product-id="<?php echo e($product->id); ?>"
							data-product-name="<?php echo e($product->name); ?>"
							data-toggle="tooltip"
							title="<?php echo e($__t('Delete this item')); ?>">
							<i class="fa-solid fa-trash"></i>
						</a>
						<div class="dropdown d-inline-block">
							<button class="btn btn-sm btn-light text-secondary"
								type="button"
								data-toggle="dropdown">
								<i class="fa-solid fa-ellipsis-v"></i>
							</button>
							<div class="table-inline-menu dropdown-menu dropdown-menu-right">
								<a class="dropdown-item"
									type="button"
									href="<?php echo e($U('/product/new?copy-of=')); ?><?php echo e($product->id); ?>">
									<span class="dropdown-item-text"><?php echo e($__t('Copy')); ?></span>
								</a>
								<a class="dropdown-item merge-products-button"
									data-product-id="<?php echo e($product->id); ?>"
									type="button"
									href="#">
									<span class="dropdown-item-text"><?php echo e($__t('Merge')); ?></span>
								</a>
							</div>
						</div>
					</td>
					<td class="productcard-trigger cursor-link"
						data-product-id="<?php echo e($product->id); ?>">
						<?php echo e($product->name); ?>

						<?php if(!empty($product->picture_file_name)): ?>
						<i class="fa-solid fa-image text-muted"
							data-toggle="tooltip"
							title="<?php echo e($__t('This product has a picture')); ?>"></i>
						<?php endif; ?>
					</td>
					<td class="<?php if(!GROCY_FEATURE_FLAG_STOCK_LOCATION_TRACKING): ?> d-none <?php endif; ?>">
						<?php
						$location = FindObjectInArrayByPropertyValue($locations, 'id', $product->location_id);
						?>
						<?php if($location != null): ?>
						<?php echo e($location->name); ?>

						<?php endif; ?>
					</td>
					<td>
						<span class="locale-number locale-number-quantity-amount"><?php echo e($product->min_stock_amount); ?></span>
					</td>
					<td>
						<?php echo e(FindObjectInArrayByPropertyValue($quantityunits, 'id', $product->qu_id_purchase)->name); ?>

					</td>
					<td>
						<?php echo e(FindObjectInArrayByPropertyValue($quantityunits, 'id', $product->qu_id_stock)->name); ?>

					</td>
					<td>
						<?php if(!empty($product->product_group_id)): ?> <?php echo e(FindObjectInArrayByPropertyValue($productGroups, 'id', $product->product_group_id)->name); ?> <?php endif; ?>
					</td>
					<td class="<?php if(!GROCY_FEATURE_FLAG_STOCK_PRICE_TRACKING): ?> d-none <?php endif; ?>">
						<?php
						$store = FindObjectInArrayByPropertyValue($shoppingLocations, 'id', $product->shopping_location_id);
						?>
						<?php if($store != null): ?>
						<?php echo e($store->name); ?>

						<?php endif; ?>
					</td>
					<td>
						<img src="<?php echo e($U('/product/' . $product->id . '/grocycode?size=25')); ?>"
							loading="lazy">
					</td>
					<td>
						<?php if(!empty($product->picture_file_name)): ?>
						<img src="<?php echo e($U('/api/files/productpictures/' . base64_encode($product->picture_file_name) . '?force_serve_as=picture&best_fit_width=64&best_fit_height=64')); ?>"
							loading="lazy">
						<?php endif; ?>
					</td>

					<?php echo $__env->make('components.userfields_tbody', array(
					'userfields' => $userfields,
					'userfieldValues' => FindAllObjectsInArrayByPropertyValue($userfieldValues, 'object_id', $product->id)
					), array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>

				</tr>
				<?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
			</tbody>
		</table>
	</div>
</div>

<div class="modal fade"
	id="merge-products-modal"
	tabindex="-1">
	<div class="modal-dialog">
		<div class="modal-content text-center">
			<div class="modal-header">
				<h4 class="modal-title w-100"><?php echo e($__t('Merge products')); ?></h4>
			</div>
			<div class="modal-body">
				<form id="merge-products-form"
					novalidate>

					<div class="form-group">
						<label for="merge-products-keep"><?php echo e($__t('Product to keep')); ?>&nbsp;<i class="fa-solid fa-question-circle text-muted"
								data-toggle="tooltip"
								data-trigger="hover click"
								title="<?php echo e($__t('After merging, this product will be kept')); ?>"></i>
						</label>
						<select class="custom-control custom-select"
							id="merge-products-keep"
							required>
							<option></option>
							<?php $__currentLoopData = $products; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $product): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
							<option value="<?php echo e($product->id); ?>"><?php echo e($product->name); ?></option>
							<?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
						</select>
					</div>
					<div class="form-group">
						<label for="merge-products-remove"><?php echo e($__t('Product to remove')); ?>&nbsp;<i class="fa-solid fa-question-circle text-muted"
								data-toggle="tooltip"
								data-trigger="hover click"
								title="<?php echo e($__t('After merging, all occurences of this product will be replaced by the kept product (means this product will not exist anymore)')); ?>"></i>
						</label>
						<select class="custom-control custom-select"
							id="merge-products-remove"
							required>
							<option></option>
							<?php $__currentLoopData = $products; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $product): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
							<option value="<?php echo e($product->id); ?>"><?php echo e($product->name); ?></option>
							<?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
						</select>
					</div>

				</form>
			</div>
			<div class="modal-footer">
				<button type="button"
					class="btn btn-secondary"
					data-dismiss="modal"><?php echo e($__t('Cancel')); ?></button>
				<button id="merge-products-save-button"
					type="button"
					class="btn btn-primary"><?php echo e($__t('OK')); ?></button>
			</div>
		</div>
	</div>
</div>

<?php echo $__env->make('components.productcard', [
'asModal' => true
], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layout.default', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH /app/views/products.blade.php ENDPATH**/ ?>