<?php
if (!isset($excludeFieldTypes))
{
$excludeFieldTypes = [];
}
?>

<?php if($userfields && count($userfields) > 0): ?>

<?php $__currentLoopData = $userfields; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $userfield): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>

<?php if(in_array($userfield->type, $excludeFieldTypes)): ?>
<?php continue; ?>
<?php endif; ?>

<?php if($userfield->show_as_column_in_tables == 1): ?>
<?php $userfieldObject = FindObjectInArrayByPropertyValue($userfieldValues, 'name', $userfield->name) ?>
<td>
	<?php if($userfieldObject !== null): ?>
	<?php if($userfield->type == \Grocy\Services\UserfieldsService::USERFIELD_TYPE_CHECKBOX): ?>
	<?php if($userfieldObject->value == 1): ?><i class="fa-solid fa-check"></i><?php endif; ?>
	<?php elseif($userfield->type == \Grocy\Services\UserfieldsService::USERFIELD_TYPE_PRESET_CHECKLIST): ?>
	<?php echo str_replace(',', '<br>', $userfieldObject->value); ?>

	<?php elseif($userfield->type == \Grocy\Services\UserfieldsService::USERFIELD_TYPE_LINK): ?>
	<a href="<?php echo e($userfieldObject->value); ?>"
		target="_blank"><?php echo e($userfieldObject->value); ?></a>
	<?php elseif($userfield->type == \Grocy\Services\UserfieldsService::USERFIELD_TYPE_LINK_WITH_TITLE): ?>
	<?php
	$title = '';
	$link = '';
	if(!empty($userfieldObject->value))
	{
	$data = json_decode($userfieldObject->value);
	$title = $data->title;
	$link = $data->link;
	}
	?>
	<a href="<?php echo e($link); ?>"
		target="_blank"><?php echo e($title); ?></a>
	<?php elseif($userfield->type == \Grocy\Services\UserfieldsService::USERFIELD_TYPE_FILE && !empty($userfieldObject->value)): ?>
	<a href="<?php echo e($U('/files/userfiles/'. $userfieldObject->value)); ?>"
		target="_blank"><?php echo e(base64_decode(explode('_', $userfieldObject->value)[1])); ?></a>
	<?php elseif($userfield->type == \Grocy\Services\UserfieldsService::USERFIELD_TYPE_IMAGE && !empty($userfieldObject->value)): ?>
	<a class="show-as-dialog-link"
		href="<?php echo e($U('/files/userfiles/'. $userfieldObject->value . '?force_serve_as=picture')); ?>">
		<img src="<?php echo e($U('/files/userfiles/'. $userfieldObject->value . '?force_serve_as=picture&best_fit_width=32&best_fit_height=32')); ?>"
			title="<?php echo e(base64_decode(explode('_', $userfieldObject->value)[1])); ?>"
			alt="<?php echo e(base64_decode(explode('_', $userfieldObject->value)[1])); ?>"
			loading="lazy">
	</a>
	<?php elseif($userfield->type == \Grocy\Services\UserfieldsService::USERFIELD_TYPE_NUMBER_DECIMAL): ?>
	<span class="locale-number locale-number-generic"><?php echo e($userfieldObject->value); ?></span>
	<?php elseif($userfield->type == \Grocy\Services\UserfieldsService::USERFIELD_TYPE_NUMBER_CURRENCY): ?>
	<span class="locale-number locale-number-currency"><?php echo e($userfieldObject->value); ?></span>
	<?php else: ?>
	<?php echo e($userfieldObject->value); ?>

	<?php endif; ?>
	<?php endif; ?>
</td>
<?php endif; ?>

<?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>

<?php endif; ?>
<?php /**PATH /app/views/components/userfields_tbody.blade.php ENDPATH**/ ?>