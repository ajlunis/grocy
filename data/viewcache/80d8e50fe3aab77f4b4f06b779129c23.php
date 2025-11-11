<?php if (! $__env->hasRenderedOnce('ae868c19-2e9c-4d65-b477-e0d5621f0d8f')): $__env->markAsRenderedOnce('ae868c19-2e9c-4d65-b477-e0d5621f0d8f'); ?>
<?php $__env->startPush('componentScripts'); ?>
<script src="<?php echo e($U('/viewjs/components/numberpicker.js', true)); ?>?v=<?php echo e($version); ?>"></script>
<?php $__env->stopPush(); ?>
<?php endif; ?>

<?php if(!isset($value)) { $value = 1; } ?>
<?php if(empty($min)) { $min = 0; } ?>
<?php if(!isset($max)) { $max = ''; } ?>
<?php if(empty($decimals)) { $decimals = 0; } ?>
<?php if(empty($hint)) { $hint = ''; } ?>
<?php if(empty($hintId)) { $hintId = ''; } ?>
<?php if(empty($additionalCssClasses)) { $additionalCssClasses = ''; } ?>
<?php if(empty($additionalGroupCssClasses)) { $additionalGroupCssClasses = ''; } ?>
<?php if(empty($additionalAttributes)) { $additionalAttributes = ''; } ?>
<?php if(empty($additionalHtmlElements)) { $additionalHtmlElements = ''; } ?>
<?php if(empty($additionalHtmlContextHelp)) { $additionalHtmlContextHelp = ''; } ?>
<?php if(!isset($isRequired)) { $isRequired = true; } ?>
<?php if(!isset($noNameAttribute)) { $noNameAttribute = false; } ?>
<?php if(empty($contextInfoId)) { $additionalHtmlContextHelp = ''; } ?>
<?php if(!isset($invalidFeedback)) { $invalidFeedback = ''; } ?>

<div id="group-<?php echo e($id); ?>"
	class="form-group <?php echo e($additionalGroupCssClasses); ?>">
	<label class="w-100"
		for="<?php echo e($id); ?>">
		<?php echo e($__t($label)); ?>

		<?php if(!empty($hint) || !empty($hintId)): ?>
		<i id="<?php echo e($hintId); ?>"
			class="fa-solid fa-question-circle text-muted"
			data-toggle="tooltip"
			data-trigger="hover click"
			title="<?php echo e($hint); ?>"></i>
		<?php endif; ?>
		<?php echo $additionalHtmlContextHelp; ?>

		<?php if(!empty($contextInfoId)): ?>
		<span id="<?php echo e($contextInfoId); ?>"
			class="small text-muted float-right mt-1"></span>
		<?php endif; ?>
	</label>
	<div class="input-group">
		<input <?php echo $additionalAttributes; ?>

			type="number"
			class="form-control numberpicker <?php echo e($additionalCssClasses); ?>"
			id="<?php echo e($id); ?>"
			<?php if(!$noNameAttribute): ?>
			name="<?php echo e($id); ?>"
			<?php endif; ?>
			value="<?php echo e($value); ?>"
			min="<?php echo e(number_format($min, $decimals, '.', '')); ?>"
			<?php if(!empty($max)): ?>
			max="<?php echo e(number_format($max, $decimals, '.', '')); ?>"
			<?php endif; ?>
			step="<?php if($decimals <= 0): ?><?php echo e(1); ?><?php else: ?><?php echo e('.' . str_repeat('0', $decimals - 1) . '1'); ?><?php endif; ?>"
			data-decimals="<?php echo e($decimals); ?>"
			<?php if($isRequired): ?>
			required
			<?php endif; ?>
			autocomplete="off">
		<div class="input-group-append">
			<div class="input-group-text numberpicker-up-button"><i class="fa-solid fa-arrow-up"></i></div>
		</div>
		<div class="input-group-append">
			<div class="input-group-text numberpicker-down-button"><i class="fa-solid fa-arrow-down"></i></div>
		</div>
		<div class="invalid-feedback"><?php echo e($invalidFeedback); ?></div>
	</div>
	<?php echo $additionalHtmlElements; ?>

</div>
<?php /**PATH /app/views/components/numberpicker.blade.php ENDPATH**/ ?>