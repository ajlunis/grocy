<?php require_frontend_packages(['bootstrap-combobox']); ?>

<?php if (! $__env->hasRenderedOnce('a2279926-9044-44e7-b8c9-c0f088bf8e0d')): $__env->markAsRenderedOnce('a2279926-9044-44e7-b8c9-c0f088bf8e0d'); ?>
<?php $__env->startPush('componentScripts'); ?>
<script src="<?php echo e($U('/viewjs/components/productpicker.js', true)); ?>?v=<?php echo e($version); ?>"></script>
<?php $__env->stopPush(); ?>
<?php $__env->startPush('componentScripts'); ?>
<script>
	Grocy.ExternalBarcodeLookupPluginName = "<?php echo e($ExternalBarcodeLookupPluginName); ?>";
</script>
<?php $__env->stopPush(); ?>
<?php endif; ?>

<?php if(empty($disallowAddProductWorkflows)) { $disallowAddProductWorkflows = false; } ?>
<?php if(empty($disallowAllProductWorkflows)) { $disallowAllProductWorkflows = false; } ?>
<?php if(empty($prefillByName)) { $prefillByName = ''; } ?>
<?php if(empty($prefillById)) { $prefillById = ''; } ?>
<?php if(!isset($isRequired)) { $isRequired = true; } ?>
<?php if(!isset($label)) { $label = 'Product'; } ?>
<?php if(!isset($disabled)) { $disabled = false; } ?>
<?php if(empty($hint)) { $hint = ''; } ?>
<?php if(empty($nextInputSelector)) { $nextInputSelector = ''; } ?>
<?php if(empty($validationMessage)) { $validationMessage = 'You have to select a product'; } ?>
<?php if(empty($additionalGroupCssClasses)) { $additionalGroupCssClasses = ''; } ?>

<div class="form-group <?php echo e($additionalGroupCssClasses); ?>"
	data-next-input-selector="<?php echo e($nextInputSelector); ?>"
	data-disallow-add-product-workflows="<?php echo e(BoolToString($disallowAddProductWorkflows)); ?>"
	data-disallow-all-product-workflows="<?php echo e(BoolToString($disallowAllProductWorkflows)); ?>"
	data-prefill-by-name="<?php echo e($prefillByName); ?>"
	data-prefill-by-id="<?php echo e($prefillById); ?>">
	<label class="w-100"
		for="product_id">
		<?php echo e($__t($label)); ?>

		<?php if(!$disallowAllProductWorkflows): ?>
		<i class="fa-solid fa-question-circle text-muted"
			data-toggle="tooltip"
			data-trigger="hover click"
			title="<?php echo e($__t('Type a new product name or barcode and hit TAB or ENTER to start a workflow')); ?>"></i>
		<?php endif; ?>
		<?php if(!empty($hint)): ?>
		<i class="fa-solid fa-question-circle text-muted"
			data-toggle="tooltip"
			data-trigger="hover click"
			title="<?php echo e($hint); ?>"></i>
		<?php endif; ?>
		<span id="barcode-lookup-disabled-hint"
			class="small text-muted d-none float-right"> <?php echo e($__t('Barcode lookup is disabled')); ?></span>
		<i id="barcode-lookup-hint"
			class="fa-solid fa-barcode float-right mt-1"></i>
	</label>
	<select class="form-control product-combobox barcodescanner-input"
		id="product_id"
		name="product_id"
		<?php if($isRequired): ?>
		required
		<?php endif; ?>
		<?php if($disabled): ?>
		disabled
		<?php endif; ?>
		data-target="@productpicker">
		<option value=""></option>
		<?php $__currentLoopData = $products; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $product): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
		<?php $bc = null;
		if(isset($barcodes)) {
		$bc = FindObjectInArrayByPropertyValue($barcodes, 'product_id', $product->id);
		}
		?>
		<option data-additional-searchdata="<?php if(isset($bc)): ?><?php echo e(strtolower($bc->barcodes)); ?><?php endif; ?>,"
			value="<?php echo e($product->id); ?>"><?php echo e($product->name); ?></option>
		<?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
	</select>
	<div class="invalid-feedback"><?php echo e($__t($validationMessage)); ?></div>
	<div id="custom-productpicker-error"
		class="form-text text-danger d-none"></div>
	<div id="flow-info-InplaceAddBarcodeToExistingProduct"
		class="form-text text-info small d-none"><strong><span id="InplaceAddBarcodeToExistingProduct"></span></strong> <?php echo e($__t('will be added to the list of barcodes for the selected product on submit')); ?></div>
</div>

<?php echo $__env->make('components.camerabarcodescanner', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
<?php /**PATH /app/views/components/productpicker.blade.php ENDPATH**/ ?>