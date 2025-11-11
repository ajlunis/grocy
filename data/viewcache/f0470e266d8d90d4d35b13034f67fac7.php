<?php require_frontend_packages(['bootstrap-select']); ?>

<?php if (! $__env->hasRenderedOnce('de23f1ae-f0d8-452e-b374-7e8fbf916a97')): $__env->markAsRenderedOnce('de23f1ae-f0d8-452e-b374-7e8fbf916a97'); ?>
<?php $__env->startPush('componentScripts'); ?>
<script src="<?php echo e($U('/viewjs/components/userfieldsform.js', true)); ?>?v=<?php echo e($version); ?>"></script>
<?php $__env->stopPush(); ?>
<?php endif; ?>

<?php if(count($userfields) > 0): ?>

<div id="userfields-form"
	data-entity="<?php echo e($entity); ?>"
	class="border border-info p-2 mb-2"
	novalidate>
	<h2 class="small"><?php echo e($__t('Userfields')); ?></h2>

	<?php $__currentLoopData = $userfields; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $userfield): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>

	<?php if($userfield->type == \Grocy\Services\UserfieldsService::USERFIELD_TYPE_SINGLE_LINE_TEXT): ?>
	<div class="form-group">
		<label><?php echo e($userfield->caption); ?></label>
		<input type="text"
			class="form-control userfield-input"
			data-userfield-name="<?php echo e($userfield->name); ?>"
			<?php if($userfield->input_required == 1): ?> required <?php endif; ?>>
		<div class="invalid-feedback"><?php echo e($__t('Mandatory Userfield')); ?></div>
	</div>
	<?php elseif($userfield->type == \Grocy\Services\UserfieldsService::USERFIELD_TYPE_SINGLE_MULTILINE_TEXT): ?>
	<div class="form-group">
		<label for="description"><?php echo e($userfield->caption); ?></label>
		<textarea class="form-control userfield-input"
			rows="4"
			data-userfield-name="<?php echo e($userfield->name); ?>"
			<?php if($userfield->input_required == 1): ?> required <?php endif; ?>></textarea>
		<div class="invalid-feedback"><?php echo e($__t('Mandatory Userfield')); ?></div>
	</div>
	<?php elseif($userfield->type == \Grocy\Services\UserfieldsService::USERFIELD_TYPE_NUMBER_INT): ?>
	<?php echo $__env->make('components.numberpicker', array(
	'id' => $userfield->name,
	'label' => $userfield->caption,
	'noNameAttribute' => true,
	'min' => 0,
	'isRequired' => $userfield->input_required == 1,
	'additionalCssClasses' => 'userfield-input',
	'additionalAttributes' => 'data-userfield-name="' . $userfield->name . '"',
	'value' => ''
	), array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
	<?php elseif($userfield->type == \Grocy\Services\UserfieldsService::USERFIELD_TYPE_NUMBER_DECIMAL): ?>
	<?php echo $__env->make('components.numberpicker', array(
	'id' => '',
	'label' => $userfield->caption,
	'noNameAttribute' => true,
	'min' => 0,
	'decimals' => 4,
	'isRequired' => $userfield->input_required == 1,
	'additionalCssClasses' => 'userfield-input',
	'additionalAttributes' => 'data-userfield-name="' . $userfield->name . '"',
	'value' => ''
	), array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
	<?php elseif($userfield->type == \Grocy\Services\UserfieldsService::USERFIELD_TYPE_NUMBER_CURRENCY): ?>
	<?php echo $__env->make('components.numberpicker', array(
	'id' => '',
	'label' => $userfield->caption,
	'noNameAttribute' => true,
	'min' => 0,
	'decimals' => 4,
	'isRequired' => $userfield->input_required == 1,
	'additionalCssClasses' => 'userfield-input locale-number-input locale-number-currency',
	'additionalAttributes' => 'data-userfield-name="' . $userfield->name . '"',
	'value' => ''
	), array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
	<?php elseif($userfield->type == \Grocy\Services\UserfieldsService::USERFIELD_TYPE_DATE): ?>
	<?php echo $__env->make('components.datetimepicker2', array(
	'id' => $userfield->name,
	'label' => $userfield->caption,
	'noNameAttribute' => true,
	'format' => 'YYYY-MM-DD',
	'initWithNow' => false,
	'limitEndToNow' => false,
	'limitStartToNow' => false,
	'additionalGroupCssClasses' => 'date-only-datetimepicker2',
	'isRequired' => $userfield->input_required == 1,
	'additionalCssClasses' => 'userfield-input',
	'additionalAttributes' => 'data-userfield-name="' . $userfield->name . '"'
	), array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
	<?php elseif($userfield->type == \Grocy\Services\UserfieldsService::USERFIELD_TYPE_DATETIME): ?>
	<?php echo $__env->make('components.datetimepicker2', array(
	'id' => $userfield->name,
	'label' => $userfield->caption,
	'noNameAttribute' => true,
	'format' => 'YYYY-MM-DD HH:mm:ss',
	'initWithNow' => false,
	'limitEndToNow' => false,
	'limitStartToNow' => false,
	'isRequired' => $userfield->input_required == 1,
	'additionalCssClasses' => 'userfield-input',
	'additionalAttributes' => 'data-userfield-name="' . $userfield->name . '"'
	), array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
	<?php elseif($userfield->type == \Grocy\Services\UserfieldsService::USERFIELD_TYPE_CHECKBOX): ?>
	<div class="form-group">
		<div class="custom-control custom-checkbox">
			<input class="form-check-input custom-control-input userfield-input"
				type="checkbox"
				id="userfield-<?php echo e($userfield->name); ?>"
				data-userfield-name="<?php echo e($userfield->name); ?>"
				value="1"
				<?php if($userfield->input_required == 1): ?> required <?php endif; ?>>
			<label class="form-check-label custom-control-label"
				for="userfield-<?php echo e($userfield->name); ?>"><?php echo e($userfield->caption); ?></label>
			<div class="invalid-feedback"><?php echo e($__t('Mandatory Userfield')); ?></div>
		</div>
	</div>
	<?php elseif($userfield->type == \Grocy\Services\UserfieldsService::USERFIELD_TYPE_PRESET_LIST): ?>
	<div class="form-group">
		<label for="<?php echo e($userfield->name); ?>"><?php echo e($userfield->caption); ?></label>
		<select class="custom-control custom-select userfield-input"
			data-userfield-name="<?php echo e($userfield->name); ?>"
			<?php if($userfield->input_required == 1): ?> required <?php endif; ?>>
			<option></option>
			<?php $__currentLoopData = preg_split('/\r\n|\r|\n/', $userfield->config); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $option): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
			<option value="<?php echo e($option); ?>"><?php echo e($option); ?></option>
			<?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
		</select>
		<div class="invalid-feedback"><?php echo e($__t('Mandatory Userfield')); ?></div>
	</div>
	<?php elseif($userfield->type == \Grocy\Services\UserfieldsService::USERFIELD_TYPE_PRESET_CHECKLIST): ?>
	<div class="form-group">
		<label for="<?php echo e($userfield->name); ?>"><?php echo e($userfield->caption); ?></label>
		<select multiple
			class="form-control userfield-input selectpicker"
			data-userfield-name="<?php echo e($userfield->name); ?>"
			data-actions-Box="true"
			data-live-search="true"
			<?php if($userfield->input_required == 1): ?> required <?php endif; ?>>
			<?php $__currentLoopData = preg_split('/\r\n|\r|\n/', $userfield->config); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $option): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
			<option value="<?php echo e($option); ?>"><?php echo e($option); ?></option>
			<?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
		</select>
		<div class="invalid-feedback"><?php echo e($__t('Mandatory Userfield')); ?></div>
	</div>
	<?php elseif($userfield->type == \Grocy\Services\UserfieldsService::USERFIELD_TYPE_LINK): ?>
	<div class="form-group">
		<label><?php echo e($userfield->caption); ?></label>
		<input type="link"
			class="form-control userfield-input"
			data-userfield-name="<?php echo e($userfield->name); ?>"
			<?php if($userfield->input_required == 1): ?> required <?php endif; ?>>
	</div>
	<?php elseif($userfield->type == \Grocy\Services\UserfieldsService::USERFIELD_TYPE_LINK_WITH_TITLE): ?>
	<div class="form-group">
		<label class="d-block"><?php echo e($userfield->caption); ?></label>
		<div class="form-row">
			<div class="col-4">
				<input type="text"
					class="form-control userfield-link userfield-link-title"
					placeholder="<?php echo e($__t('Title')); ?>"
					<?php if($userfield->input_required == 1): ?> required <?php endif; ?>>
			</div>
			<div class="col-8">
				<input type="link"
					class="form-control userfield-link userfield-link-link"
					placeholder="<?php echo e($__t('Link')); ?>"
					<?php if($userfield->input_required == 1): ?> required <?php endif; ?>>
			</div>
			<div class="invalid-feedback"><?php echo e($__t('Mandatory Userfield')); ?></div>
			<input data-userfield-type="link"
				type="hidden"
				class="userfield-input"
				data-userfield-name="<?php echo e($userfield->name); ?>">
		</div>
	</div>
	<?php elseif($userfield->type == \Grocy\Services\UserfieldsService::USERFIELD_TYPE_FILE): ?>
	<div class="form-group">
		<label><?php echo e($userfield->caption); ?></label>
		<div class="input-group">
			<div class="custom-file">
				<input type="file"
					class="custom-file-input userfield-input"
					data-userfield-name="<?php echo e($userfield->name); ?>"
					<?php if($userfield->input_required == 1): ?> required <?php endif; ?>>
				<label class="custom-file-label"
					for="<?php echo e($userfield->name); ?>">
					<?php echo e($__t('No file selected')); ?>

				</label>
				<div class="invalid-feedback"><?php echo e($__t('Mandatory Userfield')); ?></div>
			</div>
			<div class="input-group-append userfield-file-delete">
				<span class="input-group-text"><i class="fa-solid fa-trash"></i></span>
			</div>
			<div class="input-group-append">
				<a href="#"
					target="_blank"
					class="input-group-text userfield-file-show d-none discrete-link"><i class="fa-solid fa-eye"></i></a>
			</div>
		</div>
	</div>
	<?php elseif($userfield->type == \Grocy\Services\UserfieldsService::USERFIELD_TYPE_IMAGE): ?>
	<div class="form-group">
		<label><?php echo e($userfield->caption); ?></label>
		<div class="input-group">
			<div class="custom-file">
				<input type="file"
					class="custom-file-input userfield-input"
					data-userfield-name="<?php echo e($userfield->name); ?>"
					<?php if($userfield->input_required == 1): ?> required <?php endif; ?>>
				<label class="custom-file-label"
					for="<?php echo e($userfield->name); ?>">
					<?php echo e($__t('No file selected')); ?>

				</label>
				<div class="invalid-feedback"><?php echo e($__t('Mandatory Userfield')); ?></div>
			</div>
			<div class="input-group-append userfield-file-delete">
				<span class="input-group-text"><i class="fa-solid fa-trash"></i></span>
			</div>
		</div>
		<img src=""
			alt="<?php echo e($userfield->name); ?>"
			class="userfield-current-file userfield-file-show d-none mt-1 discrete-link"
			loading="lazy" />
	</div>
	<?php endif; ?>

	<?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>

</div>

<?php endif; ?>
<?php /**PATH /app/views/components/userfieldsform.blade.php ENDPATH**/ ?>