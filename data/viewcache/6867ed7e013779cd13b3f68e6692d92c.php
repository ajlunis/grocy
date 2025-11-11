<?php require_frontend_packages(['chartjs']); ?>

<?php if (! $__env->hasRenderedOnce('7ace3cb2-5ef9-49cf-9efe-60b134e2befa')): $__env->markAsRenderedOnce('7ace3cb2-5ef9-49cf-9efe-60b134e2befa'); ?>
<?php $__env->startPush('componentScripts'); ?>
<script src="<?php echo e($U('/viewjs/components/productcard.js', true)); ?>?v=<?php echo e($version); ?>"></script>
<?php $__env->stopPush(); ?>
<?php endif; ?>

<?php if(!isset($asModal)) { $asModal = false; } ?>

<?php if($asModal): ?>
<div class="modal fade"
	id="productcard-modal"
	tabindex="-1">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title"><?php echo e($__t('Product overview')); ?></h5>
				<button type="button" class="btn btn-secondary" data-dismiss="modal"><?php echo e($__t('Close')); ?></button>
			</div>
			<div class="modal-body text-center">
				<?php endif; ?>

				<div class="card productcard">
					<div class="card-header">
						<a id="productcard-product-edit-button"
							class="btn btn-sm btn-outline-secondary py-0 float-right disabled"
							href="#"
							data-toggle="tooltip"
							title="<?php echo e($__t('Edit product')); ?>">
							<i class="fa-solid fa-edit"></i>
						</a>
						<?php if(GROCY_FEATURE_FLAG_SHOPPINGLIST): ?>
						<a id="productcard-product-shoppinglist-button"
							class="btn btn-sm btn-outline-secondary py-0 mr-1 float-right disabled show-as-dialog-link"
							href="#"
							data-toggle="tooltip"
							title="<?php echo e($__t('Add to shopping list')); ?>">
							<i class="fa-solid fa-shopping-cart"></i>
						</a>
						<?php endif; ?>
						<a id="productcard-product-journal-button"
							class="btn btn-sm btn-outline-secondary py-0 mr-1 float-right disabled show-as-dialog-link"
							href="#"
							data-dialog-type="table">
							<?php echo e($__t('Stock journal')); ?>

						</a>
						<a id="productcard-product-stock-button"
							class="btn btn-sm btn-outline-secondary py-0 mr-1 float-right disabled show-as-dialog-link"
							href="#"
							data-dialog-type="table">
							<?php echo e($__t('Stock entries')); ?>

						</a>
					</div>
					<div class="card-body">
						<h3><span id="productcard-product-name"></span></h3>
						<div id="productcard-parent-product-name" class="small"></div>

						<div id="productcard-product-description-wrapper"
							class="expandable-text mb-2 d-none">
							<p id="productcard-product-description"
								class="text-muted collapse mb-0"></p>
							<a class="collapsed"
								data-toggle="collapse"
								href="#productcard-product-description"><?php echo e($__t('Show more')); ?></a>
						</div>

						<strong><?php echo e($__t('Product group')); ?>:</strong> <span id="productcard-product-group"></span><br>
						<strong><?php echo e($__t('Stock amount')); ?>:</strong>
						<span id="productcard-product-stock-amount-wrapper">
							<span id="productcard-product-stock-amount"
								class="locale-number locale-number-quantity-amount"></span> <span id="productcard-product-stock-qu-name"></span>
						</span>
						<span id="productcard-product-stock-opened-amount"
							class="small font-italic"></span>
						<span id="productcard-aggregated-amounts"
							class="pl-2 text-secondary d-none"><i class="fa-solid fa-custom-sigma-sign"></i> <span id="productcard-product-stock-amount-aggregated"
								class="locale-number locale-number-quantity-amount"></span> <span id="productcard-product-stock-qu-name-aggregated"></span> <span id="productcard-product-stock-opened-amount-aggregated"
								class="small font-italic"></span></span><br>

						<?php if(GROCY_FEATURE_FLAG_STOCK_PRICE_TRACKING): ?>
						<strong><?php echo e($__t('Stock value')); ?>:</strong> <span id="productcard-product-stock-value"
							class="locale-number locale-number-currency"></span><br>
						<?php endif; ?>

						<?php if(GROCY_FEATURE_FLAG_STOCK_LOCATION_TRACKING): ?><strong><?php echo e($__t('Default location')); ?>:</strong> <span id="productcard-product-location"></span><br><?php endif; ?>
						<strong><?php echo e($__t('Last purchased')); ?>:</strong> <span id="productcard-product-last-purchased"></span> <time id="productcard-product-last-purchased-timeago"
							class="timeago timeago-contextual"></time><br>
						<strong><?php echo e($__t('Last used')); ?>:</strong> <span id="productcard-product-last-used"></span> <time id="productcard-product-last-used-timeago"
							class="timeago timeago-contextual"></time><br>

						<?php if(GROCY_FEATURE_FLAG_STOCK_PRICE_TRACKING): ?><strong>
							<?php echo e($__t('Last price')); ?>:</strong> <span id="productcard-product-last-price"
							data-toggle="tooltip"
							data-trigger="hover click"></span>
						<br>
						<?php endif; ?>

						<?php if(GROCY_FEATURE_FLAG_STOCK_PRICE_TRACKING): ?>
						<strong><?php echo e($__t('Average price')); ?>:</strong> <span id="productcard-product-average-price"
							data-toggle="tooltip"
							data-trigger="hover click"></span>
						<br>
						<?php endif; ?>

						<?php if(GROCY_FEATURE_FLAG_STOCK_BEST_BEFORE_DATE_TRACKING): ?><strong><?php echo e($__t('Average shelf life')); ?>:</strong> <span id="productcard-product-average-shelf-life"></span><br><?php endif; ?>

						<div id="productcard-userfields-wrapper"></div>

						<p class="w-75 mt-3 mx-auto">
							<img id="productcard-product-picture"
								class="img-fluid img-thumbnail d-none"
								src=""
								loading="lazy">
						</p>

						<div id="productcard-grocycode-img" class="mb-2"></div>
						<div id="productcard-grocycode-buttons" class="d-flex justify-content-center"></div>
						<div id="productcard-barcodes" class="d-flex flex-column align-items-center"></div>

						<?php if(GROCY_FEATURE_FLAG_STOCK_PRICE_TRACKING): ?>
						<h5 class="mt-3"><?php echo e($__t('Price history')); ?></h5>
						<canvas id="productcard-product-price-history-chart"
							class="w-100 d-none"></canvas>
						<span id="productcard-no-price-data-hint"
							class="font-italic d-none"><?php echo e($__t('No price history available')); ?></span>
						<?php endif; ?>
					</div>
				</div>

				<?php if($asModal): ?>
			</div>
			<div class="modal-footer">
				<button type="button"
					class="btn btn-secondary"
					data-dismiss="modal"><?php echo e($__t('Close')); ?></button>
			</div>
		</div>
	</div>
</div>
<?php endif; ?>
<?php /**PATH /app/views/components/productcard.blade.php ENDPATH**/ ?>