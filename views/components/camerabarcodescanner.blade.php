@if (!GROCY_FEATURE_FLAG_DISABLE_BROWSER_BARCODE_CAMERA_SCANNING)

@php require_frontend_packages(['zxing']); @endphp

@once
@push('componentScripts')
<script src="{{ $U('/viewjs/components/camerabarcodescanner.js', true) }}?v={{ $version }}"></script>
@endpush
@endonce

@push('pageStyles')
<style>
	#camerabarcodescanner-start-button {
		position: absolute;
		right: 0;
		top: 0;
		bottom: 0;
		height: 100%;
		padding: 0 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		box-sizing: border-box;

		/* 👇 these 3 lines fix the mobile weirdness */
		margin-top: 0 !important;
		margin-right: 0 !important;
		-webkit-appearance: none;
		appearance: none;
	}

	.combobox-container #camerabarcodescanner-start-button {
		margin-right: 38px !important;
	}
</style>
@endpush


@endif
