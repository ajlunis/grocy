<?php require_frontend_packages(['datatables', 'summernote']); ?>



<?php if($mode == 'edit'): ?>
<?php $__env->startSection('title', $__t('Edit product')); ?>
<?php else: ?>
<?php $__env->startSection('title', $__t('Create product')); ?>
<?php endif; ?>

<?php $__env->startSection('content'); ?>
<div class="row">
	<div class="col">
		<div class="title-related-links">
			<h2 class="title"><?php echo $__env->yieldContent('title'); ?></h2>
			<?php if($mode == 'edit'): ?>
			<div class="float-right">
				<button class="btn btn-outline-dark d-md-none mt-2 order-1 order-md-3"
					type="button"
					data-toggle="collapse"
					data-target="#related-links">
					<i class="fa-solid fa-ellipsis-v"></i>
				</button>
			</div>
			<div class="related-links collapse d-md-flex order-2 width-xs-sm-100"
				id="related-links">
				<a class="btn btn-outline-secondary m-1 mt-md-0 mb-md-0 float-right show-as-dialog-link"
					href="<?php echo e($U('/stockentries?embedded&product=')); ?><?php echo e($product->id); ?>"
					data-dialog-type="table">
					<?php echo e($__t('Stock entries')); ?>

				</a>
				<a class="btn btn-outline-secondary m-1 mt-md-0 mb-md-0 float-right show-as-dialog-link"
					href="<?php echo e($U('/stockjournal?embedded&product=')); ?><?php echo e($product->id); ?>"
					data-dialog-type="table">
					<?php echo e($__t('Stock journal')); ?>

				</a>
			</div>
			<?php endif; ?>
		</div>
	</div>
</div>

<hr class="my-2">

<div class="row">
	<div class="col-lg-6 col-12">
		<script>
			Grocy.EditMode = '<?php echo e($mode); ?>';
		</script>

		<?php if($mode == 'edit'): ?>
		<script>
			Grocy.EditObjectId = <?php echo e($product->id); ?>;
		</script>

		<?php if(!empty($product->picture_file_name)): ?>
		<script>
			Grocy.ProductPictureFileName = '<?php echo e($product->picture_file_name); ?>';
		</script>
		<?php endif; ?>
		<?php endif; ?>

		<form id="product-form"
			class="has-sticky-form-footer"
			novalidate>

			<div class="form-group">
				<label for="name"><?php echo e($__t('Name')); ?></label>
				<input type="text"
					class="form-control"
					required
					id="name"
					name="name"
					value="<?php if($mode == 'edit'): ?><?php echo e($product->name); ?><?php endif; ?>">
				<div class="invalid-feedback"><?php echo e($__t('A name is required')); ?></div>
			</div>

			<div class="form-group">
				<div class="custom-control custom-checkbox">
					<input <?php if($mode=='create'
						): ?>
						checked
						<?php elseif($mode=='edit'
						&&
						$product->active == 1): ?> checked <?php endif; ?> class="form-check-input custom-control-input" type="checkbox" id="active" name="active" value="1">
					<label class="form-check-label custom-control-label"
						for="active"><?php echo e($__t('Active')); ?></label>
				</div>
			</div>

			<?php $prefillById = ''; if($mode=='edit') { $prefillById = $product->parent_product_id; } ?>
			<?php
			$hint = '';
			if ($isSubProductOfOthers)
			{
			$hint = $__t('Not possible because this product is already used as a parent product in another product');
			}
			?>
			<?php echo $__env->make('components.productpicker', array(
			'products' => $products,
			'prefillById' => $prefillById,
			'disallowAllProductWorkflows' => true,
			'isRequired' => false,
			'label' => 'Parent product',
			'disabled' => $isSubProductOfOthers,
			'hint' => $hint
			), array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
			<?php $hint = ''; ?>

			<div class="form-group">
				<label for="description"><?php echo e($__t('Description')); ?></label>
				<textarea class="form-control wysiwyg-editor"
					id="description"
					name="description"><?php if($mode == 'edit'): ?><?php echo e($product->description); ?><?php endif; ?></textarea>
			</div>

			<?php if(GROCY_FEATURE_FLAG_STOCK_LOCATION_TRACKING): ?>
			<div class="form-group">
				<label for="location_id"><?php echo e($__t('Default location')); ?></label>
				<select required
					class="custom-control custom-select"
					id="location_id"
					name="location_id">
					<option></option>
					<?php $__currentLoopData = $locations; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $location): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
					<option <?php if($mode=='edit'
						&&
						$location->id == $product->location_id): ?> selected="selected" <?php endif; ?> value="<?php echo e($location->id); ?>"><?php echo e($location->name); ?></option>
					<?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
				</select>
				<div class="invalid-feedback"><?php echo e($__t('A location is required')); ?></div>
			</div>
			<div class="form-group">
				<label for="default_consume_location_id">
					<?php echo e($__t('Default consume location')); ?>

					<i class="fa-solid fa-question-circle text-muted"
						data-toggle="tooltip"
						data-trigger="hover click"
						title="<?php echo e($__t('Stock entries at this location will be consumed first')); ?>"></i>
				</label>
				<select class="custom-control custom-select"
					id="default_consume_location_id"
					name="default_consume_location_id">
					<option></option>
					<?php $__currentLoopData = $locations; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $location): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
					<option <?php if($mode=='edit'
						&&
						$location->id == $product->default_consume_location_id): ?> selected="selected" <?php endif; ?> value="<?php echo e($location->id); ?>"><?php echo e($location->name); ?></option>
					<?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
				</select>

				<?php if(GROCY_FEATURE_FLAG_STOCK_PRODUCT_OPENED_TRACKING): ?>
				<div class="custom-control custom-checkbox">
					<input <?php if($mode=='edit'
						&&
						$product->move_on_open == 1): ?> checked <?php endif; ?> class="form-check-input custom-control-input" type="checkbox" id="move_on_open" name="move_on_open" value="1">
					<label class="form-check-label custom-control-label"
						for="move_on_open"><?php echo e($__t('Move on open')); ?>&nbsp;<i class="fa-solid fa-question-circle text-muted"
							data-toggle="tooltip"
							data-trigger="hover click"
							title="<?php echo e($__t("When enabled, on marking this product as opened, the corresponding amount will be moved to the default consume location")); ?>"></i>
					</label>
				</div>
				<?php endif; ?>

			</div>
			<?php else: ?>
			<input type="hidden"
				name="location_id"
				id="location_id"
				value="1">
			<input type="hidden"
				name="default_consume_location_id"
				id="default_consume_location_id"
				value="1">
			<?php endif; ?>

			<?php $prefillById = ''; if($mode=='edit') { $prefillById = $product->shopping_location_id; } ?>
			<?php if(GROCY_FEATURE_FLAG_STOCK_PRICE_TRACKING): ?>
			<?php echo $__env->make('components.shoppinglocationpicker', array(
			'label' => 'Default store',
			'prefillById' => $prefillById,
			'shoppinglocations' => $shoppinglocations
			), array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
			<?php else: ?>
			<input type="hidden"
				name="shopping_location_id"
				id="shopping_location_id"
				value="1">
			<?php endif; ?>

			<?php if($mode == 'edit') { $value = $product->min_stock_amount; } else { $value = 0; } ?>
			<?php echo $__env->make('components.numberpicker', array(
			'id' => 'min_stock_amount',
			'label' => 'Minimum stock amount',
			'min' => '0.',
			'decimals' => $userSettings['stock_decimal_places_amounts'],
			'value' => $value,
			'additionalGroupCssClasses' => 'mb-1',
			'additionalCssClasses' => 'locale-number-input locale-number-quantity-amount'
			), array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>

			<div class="form-group <?php if(GROCY_FEATURE_FLAG_STOCK_PRODUCT_OPENED_TRACKING): ?> mb-1 <?php endif; ?>">
				<div class="custom-control custom-checkbox">
					<input <?php if($mode=='edit'
						&&
						$product->cumulate_min_stock_amount_of_sub_products == 1): ?> checked <?php endif; ?> class="form-check-input custom-control-input" type="checkbox" id="cumulate_min_stock_amount_of_sub_products" name="cumulate_min_stock_amount_of_sub_products" value="1">
					<label class="form-check-label custom-control-label"
						for="cumulate_min_stock_amount_of_sub_products"><?php echo e($__t('Accumulate sub products min. stock amount')); ?>

						&nbsp;<i class="fa-solid fa-question-circle text-muted"
							data-toggle="tooltip"
							data-trigger="hover click"
							title="<?php echo e($__t('If enabled, the min. stock amount of sub products will be accumulated into this product, means the sub product will never be missing, only this product')); ?>"></i>
					</label>
				</div>
			</div>

			<?php if(GROCY_FEATURE_FLAG_STOCK_PRODUCT_OPENED_TRACKING): ?>
			<div class="form-group">
				<div class="custom-control custom-checkbox">
					<input <?php if($mode=='edit'
						&&
						$product->treat_opened_as_out_of_stock == 1): ?> checked <?php endif; ?> class="form-check-input custom-control-input" type="checkbox" id="treat_opened_as_out_of_stock" name="treat_opened_as_out_of_stock" value="1">
					<label class="form-check-label custom-control-label"
						for="treat_opened_as_out_of_stock"><?php echo e($__t('Treat opened as out of stock')); ?>&nbsp;<i class="fa-solid fa-question-circle text-muted"
							data-toggle="tooltip"
							data-trigger="hover click"
							title="<?php echo e($__t('When enabled, opened items will be counted as missing for calculating if this product is below its minimum stock amount')); ?>"></i>
					</label>
				</div>
			</div>
			<?php endif; ?>

			<?php if(GROCY_FEATURE_FLAG_STOCK_BEST_BEFORE_DATE_TRACKING): ?>
			<div class="form-group">
				<label class="d-block my-0"
					for="location_id"><?php echo e($__t('Due date type')); ?>

					<i class="fa-solid fa-question-circle text-muted"
						data-toggle="tooltip"
						data-trigger="hover click"
						title="<?php echo e($__t('Based on the selected type, the highlighting on the stock overview page will be different')); ?>"></i>
				</label>
				<div class="custom-control custom-radio mt-n2">
					<input class="custom-control-input"
						type="radio"
						name="due_type"
						id="due-type-bestbefore"
						value="1"
						<?php if($mode=='edit'
						&&
						$product->due_type == 1): ?> checked <?php else: ?> checked <?php endif; ?>>
					<label class="custom-control-label"
						for="due-type-bestbefore"><?php echo e($__t('Best before date')); ?>

						<i class="fa-solid fa-question-circle text-muted"
							data-toggle="tooltip"
							data-trigger="hover click"
							title="<?php echo e($__t('Means that the product is maybe still safe to be consumed after its due date is reached')); ?>"></i>
					</label>
				</div>
				<div class="custom-control custom-radio mt-n2">
					<input class="custom-control-input"
						type="radio"
						name="due_type"
						id="due-type-expiration"
						value="2"
						<?php if($mode=='edit'
						&&
						$product->due_type == 2): ?> checked <?php endif; ?>>
					<label class="custom-control-label"
						for="due-type-expiration"><?php echo e($__t('Expiration date')); ?>

						<i class="fa-solid fa-question-circle text-muted"
							data-toggle="tooltip"
							data-trigger="hover click"
							title="<?php echo e($__t('Means that the product is not safe to be consumed after its due date is reached')); ?>"></i>
					</label>
				</div>
			</div>

			<?php if($mode == 'edit') { $value = $product->default_best_before_days; } else { $value = 0; } ?>
			<?php echo $__env->make('components.numberpicker', array(
			'id' => 'default_best_before_days',
			'label' => 'Default due days',
			'min' => -1,
			'value' => $value,
			'hint' => $__t('For purchases this amount of days will be added to today for the due date suggestion') . ' (' . $__t('-1 means that this product will be never overdue') . ')'
			), array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>

			<?php if(GROCY_FEATURE_FLAG_STOCK_PRODUCT_OPENED_TRACKING): ?>
			<?php if($mode == 'edit') { $value = $product->default_best_before_days_after_open; } else { $value = 0; } ?>
			<?php echo $__env->make('components.numberpicker', array(
			'id' => 'default_best_before_days_after_open',
			'label' => 'Default due days after opened',
			'min' => 0,
			'value' => $value,
			'hint' => $__t('When this product was marked as opened, the due date will be replaced by today + this amount of days, but only if the resulting date is not after the original due date (a value of 0 disables this)')
			), array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
			<?php else: ?>
			<input type="hidden"
				name="default_best_before_days_after_open"
				id="default_best_before_days_after_open"
				value="1">
			<?php endif; ?>
			<?php else: ?>
			<input type="hidden"
				name="default_best_before_days"
				id="default_best_before_days"
				value="1">
			<input type="hidden"
				name="due_type"
				id="due_type"
				value="1">
			<?php endif; ?>

			<?php if(GROCY_FEATURE_FLAG_STOCK_PRODUCT_FREEZING): ?>
			<?php if($mode == 'edit') { $value = $product->default_best_before_days_after_freezing; } else { $value = 0; } ?>
			<?php echo $__env->make('components.numberpicker', array(
			'id' => 'default_best_before_days_after_freezing',
			'label' => 'Default due days after freezing',
			'min' => -1,
			'value' => $value,
			'hint' => $__t('On moving this product to a freezer location (so when freezing it), the due date will be replaced by today + this amount of days') . ' (' . $__t('-1 means that this product will be never overdue') . ')'
			), array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>

			<?php if($mode == 'edit') { $value = $product->default_best_before_days_after_thawing; } else { $value = 0; } ?>
			<?php echo $__env->make('components.numberpicker', array(
			'id' => 'default_best_before_days_after_thawing',
			'label' => 'Default due days after thawing',
			'min' => 0,
			'value' => $value,
			'hint' => $__t('On moving this product from a freezer location (so when thawing it), the due date will be replaced by today + this amount of days')
			), array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>

			<div class="form-group">
				<div class="custom-control custom-checkbox">
					<input <?php if($mode=='edit'
						&&
						$product->should_not_be_frozen == 1): ?> checked <?php endif; ?> class="form-check-input custom-control-input" type="checkbox" id="should_not_be_frozen" name="should_not_be_frozen" value="1">
					<label class="form-check-label custom-control-label"
						for="should_not_be_frozen"><?php echo e($__t('Should not be frozen')); ?>&nbsp;<i class="fa-solid fa-question-circle text-muted"
							data-toggle="tooltip"
							data-trigger="hover click"
							title="<?php echo e($__t('When enabled, on moving this product to a freezer location (so when freezing it), a warning will be shown')); ?>"></i>
					</label>
				</div>
			</div>
			<?php else: ?>
			<input type="hidden"
				name="default_best_before_days_after_freezing"
				value="0">
			<input type="hidden"
				name="default_best_before_days_after_thawing"
				value="0">
			<input type="hidden"
				name="should_not_be_frozen"
				value="0">
			<?php endif; ?>

			<div class="form-group">
				<label for="product_group_id"><?php echo e($__t('Product group')); ?></label>
				<select class="custom-control custom-select"
					id="product_group_id"
					name="product_group_id">
					<option></option>
					<?php $__currentLoopData = $productgroups; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $productgroup): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
					<option <?php if($mode=='edit'
						&&
						$productgroup->id == $product->product_group_id): ?> selected="selected" <?php endif; ?> value="<?php echo e($productgroup->id); ?>"><?php echo e($productgroup->name); ?></option>
					<?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
				</select>
			</div>

			<div class="form-group">
				<label for="qu_id_stock"><?php echo e($__t('Quantity unit stock')); ?></label>
				<select required
					class="custom-control custom-select input-group-qu"
					id="qu_id_stock"
					name="qu_id_stock">
					<option></option>
					<?php $__currentLoopData = $quantityunitsStock; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $quantityunit): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
					<option <?php if($mode=='edit'
						&&
						$quantityunit->id == $product->qu_id_stock): ?> selected="selected" <?php endif; ?> value="<?php echo e($quantityunit->id); ?>" data-plural-form="<?php echo e($quantityunit->name_plural); ?>"><?php echo e($quantityunit->name); ?></option>
					<?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
				</select>
				<div class="invalid-feedback"><?php echo e($__t('A quantity unit is required')); ?></div>
			</div>

			<div class="form-group">
				<label for="qu_id_purchase"><?php echo e($__t('Default quantity unit purchase')); ?></label>
				<i class="fa-solid fa-question-circle text-muted"
					data-toggle="tooltip"
					data-trigger="hover click"
					title="<?php echo e($__t('This is the default quantity unit used on purchase and when adding this product to the shopping list')); ?>"></i>
				<select required
					class="custom-control custom-select input-group-qu"
					id="qu_id_purchase"
					name="qu_id_purchase">
					<option></option>
					<?php $__currentLoopData = $referencedQuantityunits; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $quantityunit): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
					<option <?php if($mode=='edit'
						&&
						$quantityunit->id == $product->qu_id_purchase): ?> selected="selected" <?php endif; ?> value="<?php echo e($quantityunit->id); ?>"><?php echo e($quantityunit->name); ?></option>
					<?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
				</select>
				<div class="invalid-feedback"><?php echo e($__t('A quantity unit is required')); ?></div>
			</div>

			<div class="form-group">
				<label for="qu_id_consume"><?php echo e($__t('Default quantity unit consume')); ?></label>
				<i class="fa-solid fa-question-circle text-muted"
					data-toggle="tooltip"
					data-trigger="hover click"
					title="<?php echo e($__t('This is the default quantity unit used when consuming this product')); ?>"></i>
				<select required
					class="custom-control custom-select input-group-qu"
					id="qu_id_consume"
					name="qu_id_consume">
					<option></option>
					<?php $__currentLoopData = $referencedQuantityunits; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $quantityunit): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
					<option <?php if($mode=='edit'
						&&
						$quantityunit->id == $product->qu_id_consume): ?> selected="selected" <?php endif; ?> value="<?php echo e($quantityunit->id); ?>"><?php echo e($quantityunit->name); ?></option>
					<?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
				</select>
				<div class="invalid-feedback"><?php echo e($__t('A quantity unit is required')); ?></div>
			</div>

			<div class="form-group">
				<label for="qu_id_price"><?php echo e($__t('Quantity unit for prices')); ?></label>
				<i class="fa-solid fa-question-circle text-muted"
					data-toggle="tooltip"
					data-trigger="hover click"
					title="<?php echo e($__t('When displaying prices for this product, they will be related to this quantity unit')); ?>"></i>
				<select required
					class="custom-control custom-select input-group-qu"
					id="qu_id_price"
					name="qu_id_price">
					<option></option>
					<?php $__currentLoopData = $referencedQuantityunits; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $quantityunit): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
					<option <?php if($mode=='edit'
						&&
						$quantityunit->id == $product->qu_id_price): ?> selected="selected" <?php endif; ?> value="<?php echo e($quantityunit->id); ?>"><?php echo e($quantityunit->name); ?></option>
					<?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
				</select>
				<div class="invalid-feedback"><?php echo e($__t('A quantity unit is required')); ?></div>
			</div>

			<div class="form-group mb-1">
				<div class="custom-control custom-checkbox">
					<input <?php if($mode=='edit'
						&&
						$product->enable_tare_weight_handling == 1): ?> checked <?php endif; ?> class="form-check-input custom-control-input" type="checkbox" id="enable_tare_weight_handling" name="enable_tare_weight_handling" value="1">
					<label class="form-check-label custom-control-label"
						for="enable_tare_weight_handling"><?php echo e($__t('Enable tare weight handling')); ?>

						&nbsp;<i class="fa-solid fa-question-circle text-muted"
							data-toggle="tooltip"
							data-trigger="hover click"
							title="<?php echo e($__t('This is useful e.g. for flour in jars - on purchase/consume/inventory you always weigh the whole jar, the amount to be posted is then automatically calculated based on what is in stock and the tare weight defined below')); ?>"></i>
					</label>
				</div>
			</div>

			<?php if($mode == 'edit') { $value = $product->tare_weight; } else { $value = 0; } ?>
			<?php if(($mode == 'edit' && $product->enable_tare_weight_handling == 0) || $mode == 'create') { $additionalAttributes = 'disabled'; } else { $additionalAttributes = ''; } ?>
			<?php echo $__env->make('components.numberpicker', array(
			'id' => 'tare_weight',
			'label' => 'Tare weight',
			'min' => 0,
			'decimals' => $userSettings['stock_decimal_places_amounts'],
			'value' => $value,
			'additionalAttributes' => $additionalAttributes,
			'contextInfoId' => 'tare_weight_qu_info',
			'additionalCssClasses' => 'locale-number-input locale-number-quantity-amount'
			), array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
			<?php $additionalAttributes = '' ?>

			<?php if(GROCY_FEATURE_FLAG_RECIPES): ?>
			<div class="form-group">
				<div class="custom-control custom-checkbox">
					<input <?php if($mode=='edit'
						&&
						$product->not_check_stock_fulfillment_for_recipes == 1): ?> checked <?php endif; ?> class="form-check-input custom-control-input" type="checkbox" id="not_check_stock_fulfillment_for_recipes" name="not_check_stock_fulfillment_for_recipes" value="1">
					<label class="form-check-label custom-control-label"
						for="not_check_stock_fulfillment_for_recipes"><?php echo e($__t('Disable stock fulfillment checking for this ingredient')); ?>

						&nbsp;<i class="fa-solid fa-question-circle text-muted"
							data-toggle="tooltip"
							data-trigger="hover click"
							title="<?php echo e($__t('This will be used as the default setting when adding this product as a recipe ingredient')); ?>"></i>
					</label>
				</div>
			</div>
			<?php else: ?>
			<input type="hidden"
				name="not_check_stock_fulfillment_for_recipes"
				id="not_check_stock_fulfillment_for_recipes"
				value="0">
			<?php endif; ?>

			<?php if($mode == 'edit') { $value = $product->calories; } else { $value = 0; } ?>
			<?php echo $__env->make('components.numberpicker', array(
			'id' => 'calories',
			'label' => 'Energy',
			'min' => '0.' . str_repeat('0', $userSettings['stock_decimal_places_amounts']),
			'decimals' => $userSettings['stock_decimal_places_amounts'],
			'value' => $value,
			'hint' => $__t('Per stock quantity unit'),
			'contextInfoId' => 'energy_qu_info',
			'isRequired' => false,
			'additionalCssClasses' => 'locale-number-input locale-number-quantity-amount'
			), array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>

			<?php if($mode == 'edit') { $value = $product->quick_consume_amount; } else { $value = 1; } ?>
			<?php echo $__env->make('components.numberpicker', array(
			'id' => 'quick_consume_amount',
			'label' => 'Quick consume amount',
			'min' => $DEFAULT_MIN_AMOUNT,
			'decimals' => $userSettings['stock_decimal_places_amounts'],
			'value' => $value,
			'hint' => $__t('This amount is used for the "quick consume button" on the stock overview page (related to quantity unit stock)'),
			'contextInfoId' => 'quick_consume_qu_info',
			'additionalCssClasses' => 'locale-number-input locale-number-quantity-amount'
			), array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>

			<?php if($mode == 'edit') { $value = $product->quick_open_amount; } else { $value = 1; } ?>
			<?php echo $__env->make('components.numberpicker', array(
			'id' => 'quick_open_amount',
			'label' => 'Quick open amount',
			'min' => $DEFAULT_MIN_AMOUNT,
			'decimals' => $userSettings['stock_decimal_places_amounts'],
			'value' => $value,
			'hint' => $__t('This amount is used for the "quick open button" on the stock overview page (related to quantity unit stock)'),
			'contextInfoId' => 'quick_open_qu_info',
			'additionalCssClasses' => 'locale-number-input locale-number-quantity-amount'
			), array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>

			<?php if(GROCY_FEATURE_FLAG_LABEL_PRINTER): ?>
			<div class="form-group">
				<label for="default_stock_label_type"><?php echo e($__t('Default stock entry label')); ?></label>
				<i class="fa-solid fa-question-circle text-muted"
					data-toggle="tooltip"
					data-trigger="hover click"
					title="<?php echo e($__t('This is the default which will be prefilled on purchase')); ?>"></i>
				<select class="custom-control custom-select"
					id="default_stock_label_type"
					name="default_stock_label_type">
					<option <?php if($mode=='edit'
						&&
						$product->default_stock_label_type == 0 ): ?> selected="selected" <?php endif; ?> value="0"><?php echo e($__t('No label')); ?></option>
					<option <?php if($mode=='edit'
						&&
						$product->default_stock_label_type == 1 ): ?> selected="selected" <?php endif; ?> value="1"><?php echo e($__t('Single label')); ?></option>
					<option <?php if($mode=='edit'
						&&
						$product->default_stock_label_type == 2 ): ?> selected="selected" <?php endif; ?> value="2"><?php echo e($__t('Label per unit')); ?></option>
				</select>
			</div>

			<div class="form-group">
				<div class="custom-control custom-checkbox">
					<input <?php if($mode=='edit'
						&&
						$product->auto_reprint_stock_label == 1): ?> checked <?php endif; ?> class="form-check-input custom-control-input" type="checkbox" id="auto_reprint_stock_label" name="auto_reprint_stock_label" value="1">
					<label class="form-check-label custom-control-label"
						for="auto_reprint_stock_label"><?php echo e($__t('Auto reprint stock entry label')); ?>&nbsp;<i class="fa-solid fa-question-circle text-muted"
							data-toggle="tooltip"
							data-trigger="hover click"
							title="<?php echo e($__t('When enabled, auto-changing the due date of a stock entry (by opening/freezing/thawing and having corresponding default due days set) will reprint its label')); ?>"></i>
					</label>
				</div>
			</div>
			<?php endif; ?>

			<?php if(GROCY_FEATURE_FLAG_STOCK_PRICE_TRACKING): ?>
			<div class="form-group">
				<label class="d-block my-0"
					for="default_purchase_price_type"><?php echo e($__t('Default purchase price type')); ?>

					<i class="fa-solid fa-question-circle text-muted"
						data-toggle="tooltip"
						data-trigger="hover click"
						title="<?php echo e($__t('This will be used as the default price type selection on purchase')); ?>"></i>
				</label>
				<div class="custom-control custom-radio mt-n2">
					<input class="custom-control-input"
						type="radio"
						name="default_purchase_price_type"
						id="default-purchase-price-type-unspecified"
						value="1"
						<?php if($mode=='edit'
						&&
						$product->default_purchase_price_type == 1): ?> checked <?php else: ?> checked <?php endif; ?>>
					<label class="custom-control-label"
						for="default-purchase-price-type-unspecified"><?php echo e($__t('Unspecified')); ?>

					</label>
				</div>
				<div class="custom-control custom-radio mt-n2">
					<input class="custom-control-input"
						type="radio"
						name="default_purchase_price_type"
						id="default-purchase-price-type-unit-price"
						value="2"
						<?php if($mode=='edit'
						&&
						$product->default_purchase_price_type == 2): ?> checked <?php endif; ?>>
					<label class="custom-control-label"
						for="default-purchase-price-type-unit-price"><?php echo e($__t('Unit price')); ?>

					</label>
				</div>
				<div class="custom-control custom-radio mt-n2">
					<input class="custom-control-input"
						type="radio"
						name="default_purchase_price_type"
						id="default-purchase-price-type-total-price"
						value="3"
						<?php if($mode=='edit'
						&&
						$product->default_purchase_price_type == 3): ?> checked <?php endif; ?>>
					<label class="custom-control-label"
						for="default-purchase-price-type-total-price"><?php echo e($__t('Total price')); ?>

					</label>
				</div>
			</div>
			<?php endif; ?>

			<?php if(GROCY_FEATURE_FLAG_STOCK_PRODUCT_OPENED_TRACKING): ?>
			<div class="form-group">
				<div class="custom-control custom-checkbox">
					<input <?php if($mode=='edit'
						&&
						$product->disable_open == 1): ?> checked <?php endif; ?> class="form-check-input custom-control-input" type="checkbox" id="disable_open" name="disable_open" value="1">
					<label class="form-check-label custom-control-label"
						for="disable_open"><?php echo e($__t('Can\'t be opened')); ?>

					</label>
				</div>
			</div>
			<?php endif; ?>

			<div class="form-group">
				<div class="custom-control custom-checkbox">
					<input <?php if($mode=='edit'
						&&
						$product->hide_on_stock_overview == 1): ?> checked <?php endif; ?> class="form-check-input custom-control-input" type="checkbox" id="hide_on_stock_overview" name="hide_on_stock_overview" value="1">
					<label class="form-check-label custom-control-label"
						for="hide_on_stock_overview"><?php echo e($__t('Never show on stock overview')); ?>&nbsp;<i class="fa-solid fa-question-circle text-muted"
							data-toggle="tooltip"
							data-trigger="hover click"
							title="<?php echo e($__t('The stock overview page lists all products which are currently in stock or below their min. stock amount - enable this to hide this product there always')); ?>"></i>
					</label>
				</div>
			</div>

			<div class="form-group">
				<div class="custom-control custom-checkbox">
					<input <?php if($mode=='edit'
						&&
						$product->no_own_stock == 1): ?> checked <?php endif; ?> class="form-check-input custom-control-input" type="checkbox" id="no_own_stock" name="no_own_stock" value="1">
					<label class="form-check-label custom-control-label"
						for="no_own_stock"><?php echo e($__t('Disable own stock')); ?>&nbsp;<i class="fa-solid fa-question-circle text-muted"
							data-toggle="tooltip"
							data-trigger="hover click"
							title="<?php echo e($__t('When enabled, this product can\'t have own stock, means it will not be selectable on purchase (useful for parent products which are just used as a summary/total view of the child products)')); ?>"></i>
					</label>
				</div>
			</div>

			<?php echo $__env->make('components.userfieldsform', array(
			'userfields' => $userfields,
			'entity' => 'products'
			), array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>

			<div class="py-5"></div>
			<div class="sticky-form-footer pt-1">
				<small id="save-hint"
					class="my-1 form-text text-muted <?php if($mode == 'edit'): ?> d-none <?php endif; ?>"><?php echo e($__t('Save & continue to add quantity unit conversions & barcodes')); ?></small>

				<button id="save-product-button"
					class="save-product-button btn btn-success mb-2 default-submit-button"
					data-location="continue"><?php echo e($__t('Save & continue')); ?></button>
				<button class="save-product-button btn btn-info mb-2"
					data-location="return"><?php echo e($__t('Save & return to products')); ?></button>
			</div>
		</form>

	</div>

	<div class="col-lg-6 col-12">

		<div class="row <?php if($mode == 'create' || !GROCY_FEATURE_FLAG_STOCK): ?> d-none <?php endif; ?>">
			<div class="col">
				<div class="title-related-links">
					<h4>
						<?php echo e($__t('Barcodes')); ?>

					</h4>
					<button class="btn btn-outline-dark d-md-none mt-2 float-right order-1 order-md-3"
						type="button"
						data-toggle="collapse"
						data-target="#related-links">
						<i class="fa-solid fa-ellipsis-v"></i>
					</button>
					<?php if($mode == "edit"): ?>
					<div class="related-links collapse d-md-flex order-2 width-xs-sm-100"
						id="related-links">
						<a class="btn btn-primary btn-sm m-1 mt-md-0 mb-md-0 float-right show-as-dialog-link"
							href="<?php echo e($U('/productbarcodes/new?embedded&product=' . $product->id )); ?>">
							<?php echo e($__t('Add')); ?>

						</a>
					</div>
					<?php endif; ?>
				</div>

				<h5 id="barcode-headline-info"
					class="text-muted font-italic"></h5>

				<table id="barcode-table"
					class="table table-sm table-striped nowrap w-100">
					<thead>
						<tr>
							<th class="border-right"><a class="text-muted change-table-columns-visibility-button"
									data-toggle="tooltip"
									title="<?php echo e($__t('Table options')); ?>"
									data-table-selector="#barcode-table"
									href="#"><i class="fa-solid fa-eye"></i></a>
							</th>
							<th><?php echo e($__t('Barcode')); ?></th>
							<th class="<?php if(!GROCY_FEATURE_FLAG_STOCK_PRICE_TRACKING): ?> d-none <?php endif; ?> allow-grouping"><?php echo e($__t('Store')); ?></th>
							<th class="allow-grouping"><?php echo e($__t('Quantity unit')); ?></th>
							<th><?php echo e($__t('Amount')); ?></th>
							<th class="<?php if(!GROCY_FEATURE_FLAG_STOCK_PRICE_TRACKING): ?> d-none <?php endif; ?>"><?php echo e($__t('Last price')); ?></th>
							<th><?php echo e($__t('Note')); ?></th>

							<?php echo $__env->make('components.userfields_thead', array(
							'userfields' => $productBarcodeUserfields
							), array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
						</tr>
					</thead>
					<tbody class="d-none">
						<?php if($mode == "edit"): ?>
						<?php $__currentLoopData = $barcodes; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $barcode): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
						<?php if($barcode->product_id == $product->id || $barcode->product_id == null): ?>
						<tr>
							<td class="fit-content border-right">
								<a class="btn btn-sm btn-info show-as-dialog-link <?php if($barcode->product_id == null): ?> disabled <?php endif; ?>"
									href="<?php echo e($U('/productbarcodes/' . $barcode->id . '?embedded&product=' . $product->id )); ?>">
									<i class="fa-solid fa-edit"></i>
								</a>
								<a class="btn btn-sm btn-danger barcode-delete-button <?php if($barcode->product_id == null): ?> disabled <?php endif; ?>"
									href="#"
									data-barcode-id="<?php echo e($barcode->id); ?>"
									data-barcode="<?php echo e($barcode->barcode); ?>"
									data-product-barcode="<?php echo e($product->barcode); ?>"
									data-product-id="<?php echo e($product->id); ?>">
									<i class="fa-solid fa-trash"></i>
								</a>
							</td>
							<td>
								<?php echo e($barcode->barcode); ?>

							</td>
							<td class="<?php if(!GROCY_FEATURE_FLAG_STOCK_PRICE_TRACKING): ?> d-none <?php endif; ?>"
								id="barcode-shopping-location">
								<?php if(FindObjectInArrayByPropertyValue($shoppinglocations, 'id', $barcode->shopping_location_id) !== null): ?>
								<?php echo e(FindObjectInArrayByPropertyValue($shoppinglocations, 'id', $barcode->shopping_location_id)->name); ?>

								<?php endif; ?>
							</td>
							<td>
								<?php if(!empty($barcode->qu_id)): ?>
								<?php echo e(FindObjectInArrayByPropertyValue($quantityunits, 'id', $barcode->qu_id)->name); ?>

								<?php endif; ?>
							</td>
							<td>
								<?php if(!empty($barcode->amount)): ?>
								<span class="locale-number locale-number-quantity-amount"><?php echo e($barcode->amount); ?></span>
								<?php endif; ?>
							</td>
							<td class="<?php if(!GROCY_FEATURE_FLAG_STOCK_PRICE_TRACKING): ?> d-none <?php endif; ?>">
								<span class="locale-number locale-number-currency"><?php echo e($barcode->last_price); ?></span>
							</td>
							<td>
								<?php echo e($barcode->note); ?>

							</td>

							<?php echo $__env->make('components.userfields_tbody', array(
							'userfields' => $productBarcodeUserfields,
							'userfieldValues' => FindAllObjectsInArrayByPropertyValue($productBarcodeUserfieldValues, 'object_id', $barcode->id)
							), array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
						</tr>
						<?php endif; ?>
						<?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
						<?php endif; ?>
					</tbody>
				</table>
			</div>
		</div>

		<div class="row mt-2 <?php if($mode == 'create'): ?> d-none <?php endif; ?>">
			<div class="col clearfix">
				<div class="title-related-links">
					<h4>
						<span class="ls-n1"><?php echo e($__t('Grocycode')); ?></span>
						<i class="fa-solid fa-question-circle text-muted"
							data-toggle="tooltip"
							data-trigger="hover click"
							title="<?php echo e($__t('Grocycode is a unique referer to this %s in your Grocy instance - print it onto a label and scan it like any other barcode', $__t('Product'))); ?>"></i>
					</h4>
					<p>
						<?php if($mode == 'edit'): ?>
						<img src="<?php echo e($U('/product/' . $product->id . '/grocycode?size=60')); ?>"
							class="float-lg-left"
							loading="lazy">
						<?php endif; ?>
					</p>
					<p>
						<a class="btn btn-outline-primary btn-sm"
							href="<?php echo e($U('/product/' . $product->id . '/grocycode?download=true')); ?>"><?php echo e($__t('Download')); ?></a>
						<?php if(GROCY_FEATURE_FLAG_LABEL_PRINTER): ?>
						<a class="btn btn-outline-primary btn-sm product-grocycode-label-print"
							data-product-id="<?php echo e($product->id); ?>"
							href="#">
							<?php echo e($__t('Print on label printer')); ?>

						</a>
						<?php endif; ?>
					</p>
				</div>
			</div>
		</div>

		<div class="row <?php if(GROCY_FEATURE_FLAG_STOCK): ?> mt-5 <?php endif; ?> <?php if($mode == 'create'): ?> d-none <?php endif; ?>">
			<div class="col">
				<div class="title-related-links">
					<h4>
						<?php echo e($__t('Product specific QU conversions')); ?>

					</h4>
					<button class="btn btn-outline-dark d-md-none mt-2 float-right order-1 order-md-3"
						type="button"
						data-toggle="collapse"
						data-target="#related-links">
						<i class="fa-solid fa-ellipsis-v"></i>
					</button>
					<?php if($mode == "edit"): ?>
					<div class="related-links collapse d-md-flex order-2 width-xs-sm-100"
						id="related-links">
						<a class="btn btn-primary btn-sm m-1 mt-md-0 mb-md-0 float-right show-as-dialog-link"
							href="<?php echo e($U('/quantityunitconversion/new?embedded&product=' . $product->id )); ?>"
							data-dialog-type="wider">
							<?php echo e($__t('Add')); ?>

						</a>
						<a class="btn btn-outline-primary btn-sm m-1 mt-md-0 mb-md-0 float-right show-as-dialog-link"
							href="<?php echo e($U('/quantityunitconversionsresolved?embedded&product=' . $product->id )); ?>"
							data-dialog-type="wider"
							data-toggle="tooltip"
							title="<?php echo e($__t('This shows all to this product directly or indirectly related quantity units and their derived conversion factors')); ?>">
							<?php echo e($__t('Show resolved conversions')); ?>

						</a>
					</div>
					<?php endif; ?>
				</div>

				<table id="qu-conversions-table-products"
					class="table table-sm table-striped nowrap w-100">
					<thead>
						<tr>
							<th class="border-right"><a class="text-muted change-table-columns-visibility-button"
									data-toggle="tooltip"
									title="<?php echo e($__t('Table options')); ?>"
									data-table-selector="#qu-conversions-table-products"
									href="#"><i class="fa-solid fa-eye"></i></a>
							</th>
							<th class="allow-grouping"><?php echo e($__t('Quantity unit from')); ?></th>
							<th class="allow-grouping"><?php echo e($__t('Quantity unit to')); ?></th>
							<th><?php echo e($__t('Factor')); ?></th>
							<th></th>
						</tr>
					</thead>
					<tbody class="d-none">
						<?php if($mode == "edit"): ?>
						<?php $__currentLoopData = $quConversions; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $quConversion): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
						<tr>
							<td class="fit-content border-right">
								<a class="btn btn-sm btn-info show-as-dialog-link <?php if($quConversion->product_id == null): ?> disabled <?php endif; ?>"
									href="<?php echo e($U('/quantityunitconversion/' . $quConversion->id . '?embedded&product=' . $product->id )); ?>"
									data-dialog-type="wider">
									<i class="fa-solid fa-edit"></i>
								</a>
								<a class="btn btn-sm btn-danger qu-conversion-delete-button <?php if($quConversion->product_id == null): ?> disabled <?php endif; ?>"
									href="#"
									data-qu-conversion-id="<?php echo e($quConversion->id); ?>">
									<i class="fa-solid fa-trash"></i>
								</a>
							</td>
							<td>
								<?php echo e(FindObjectInArrayByPropertyValue($quantityunits, 'id', $quConversion->from_qu_id)->name); ?>

							</td>
							<td>
								<?php echo e(FindObjectInArrayByPropertyValue($quantityunits, 'id', $quConversion->to_qu_id)->name); ?>

							</td>
							<td>
								<span class="locale-number locale-number-quantity-amount"><?php echo e($quConversion->factor); ?></span>
							</td>
							<td class="font-italic">
								<?php echo $__t('This means 1 %1$s is the same as %2$s %3$s', FindObjectInArrayByPropertyValue($quantityunits, 'id', $quConversion->from_qu_id)->name, '<span class="locale-number locale-number-quantity-amount">' . $quConversion->factor . '</span>', $__n($quConversion->factor, FindObjectInArrayByPropertyValue($quantityunits, 'id', $quConversion->to_qu_id)->name, FindObjectInArrayByPropertyValue($quantityunits, 'id', $quConversion->to_qu_id)->name_plural, true)); ?>

							</td>
						</tr>
						<?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
						<?php endif; ?>
					</tbody>
				</table>
			</div>
		</div>

		<div class="row <?php if($mode == 'edit'): ?> mt-5 <?php endif; ?>">
			<div class="col">
				<div class="title-related-links">
					<h4>
						<?php echo e($__t('Picture')); ?>

					</h4>
					<div class="form-group w-75 m-0">
						<div class="input-group">
							<div class="custom-file">
								<input type="file"
									class="custom-file-input"
									id="product-picture"
									accept="image/*">
								<label id="product-picture-label"
									class="custom-file-label <?php if(empty($product->picture_file_name)): ?> d-none <?php endif; ?>"
									for="product-picture">
									<?php echo e($product->picture_file_name); ?>

								</label>
								<label id="product-picture-label-none"
									class="custom-file-label <?php if(!empty($product->picture_file_name)): ?> d-none <?php endif; ?>"
									for="product-picture">
									<?php echo e($__t('No file selected')); ?>

								</label>
							</div>
							<div class="input-group-append">
								<span class="input-group-text"><i class="fa-solid fa-trash"
										id="delete-current-product-picture-button"></i></span>
							</div>
						</div>
					</div>
				</div>
				<?php if($mode == "edit" && !empty($product->picture_file_name)): ?>
				<img id="current-product-picture"
					src="<?php echo e($U('/api/files/productpictures/' . base64_encode($product->picture_file_name) . '?force_serve_as=picture&best_fit_width=400')); ?>"
					class="img-fluid img-thumbnail mt-2 mb-5"
					loading="lazy">
				<p id="delete-current-product-picture-on-save-hint"
					class="form-text text-muted font-italic d-none pb-5"><?php echo e($__t('The current picture will be deleted on save')); ?></p>
				<?php else: ?>
				<p id="no-current-product-picture-hint"
					class="form-text text-muted font-italic pb-5"><?php echo e($__t('No picture available')); ?></p>
				<?php endif; ?>
			</div>
		</div>
	</div>
</div>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layout.default', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH /app/views/productform.blade.php ENDPATH**/ ?>