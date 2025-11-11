<?php require_frontend_packages(['bootstrap-combobox']); ?>

<?php if (! $__env->hasRenderedOnce('01d9a9d2-63cf-4c9e-8a1e-574c406c184e')): $__env->markAsRenderedOnce('01d9a9d2-63cf-4c9e-8a1e-574c406c184e'); ?>
<?php $__env->startPush('componentScripts'); ?>
<script src="<?php echo e($U('/viewjs/components/shoppinglocationpicker.js', true)); ?>?v=<?php echo e($version); ?>"></script>
<?php $__env->stopPush(); ?>
<?php endif; ?>

<?php if(empty($prefillByName)) { $prefillByName = ''; } ?>
<?php if(empty($prefillById)) { $prefillById = ''; } ?>
<?php if(!isset($isRequired)) { $isRequired = false; } ?>
<?php if(empty($hint)) { $hint = ''; } ?>
<?php if(empty($nextInputSelector)) { $nextInputSelector = ''; } ?>

<div class="form-group"
	data-next-input-selector="<?php echo e($nextInputSelector); ?>"
	data-prefill-by-name="<?php echo e($prefillByName); ?>"
	data-prefill-by-id="<?php echo e($prefillById); ?>">
	<label for="shopping_location_id"><?php echo e($__t($label)); ?>

		<?php if(!empty($hint)): ?>
		<i class="fa-solid fa-question-circle text-muted"
			data-toggle="tooltip"
			data-trigger="hover click"
			title="<?php echo e($hint); ?>"></i>
		<?php endif; ?>
	</label>
	<select class="form-control shopping-location-combobox"
		id="shopping_location_id"
		name="shopping_location_id"
		<?php if($isRequired): ?>
		required
		<?php endif; ?>>
		<option value=""></option>
		<?php $__currentLoopData = $shoppinglocations; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $shoppinglocation): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
		<option value="<?php echo e($shoppinglocation->id); ?>"><?php echo e($shoppinglocation->name); ?></option>
		<?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
	</select>
	<div class="invalid-feedback"><?php echo e($__t('You have to select a store')); ?></div>
</div>
<?php /**PATH /app/views/components/shoppinglocationpicker.blade.php ENDPATH**/ ?>