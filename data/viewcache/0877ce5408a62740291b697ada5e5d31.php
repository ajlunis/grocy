<?php if(!GROCY_FEATURE_FLAG_DISABLE_BROWSER_BARCODE_CAMERA_SCANNING): ?>

<?php require_frontend_packages(['zxing']); ?>

<?php if (! $__env->hasRenderedOnce('e0f678b5-50ca-459e-9189-d1b396038ded')): $__env->markAsRenderedOnce('e0f678b5-50ca-459e-9189-d1b396038ded'); ?>
<?php $__env->startPush('componentScripts'); ?>
<script src="<?php echo e($U('/viewjs/components/camerabarcodescanner.js', true)); ?>?v=<?php echo e($version); ?>"></script>
<?php $__env->stopPush(); ?>
<?php endif; ?>

<?php $__env->startPush('pageStyles'); ?>
<style>
	#camerabarcodescanner-start-button {
		position: absolute;
		right: 0;
		margin-top: 4px;
		margin-right: 5px;
		cursor: pointer;
	}

	.combobox-container #camerabarcodescanner-start-button {
		margin-right: 38px !important;
	}
</style>
<?php $__env->stopPush(); ?>

<?php endif; ?>
<?php /**PATH /app/views/components/camerabarcodescanner.blade.php ENDPATH**/ ?>