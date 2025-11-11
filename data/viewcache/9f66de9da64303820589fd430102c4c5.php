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
<th class="allow-grouping"><?php echo e($userfield->caption); ?></th>
<?php endif; ?>

<?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>

<?php endif; ?>
<?php /**PATH /app/views/components/userfields_thead.blade.php ENDPATH**/ ?>