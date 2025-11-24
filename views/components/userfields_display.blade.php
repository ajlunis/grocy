@if($userfields && count($userfields) > 0)
<div class="table-responsive">
	<table class="table table-sm table-striped mb-0">
		@foreach($userfields as $userfield)
		@php $value = $userfieldValues[$userfield->name] ?? null; @endphp

		@if($value === null || $value === "")
		@continue
		@endif

		<tr>
			<td class="font-weight-bold">{{ $userfield->caption }}</td>
			<td>
				@if($userfield->type == \Grocy\Services\UserfieldsService::USERFIELD_TYPE_CHECKBOX)
				@if($value == 1)<i class="fa-solid fa-check"></i>@else<i class="fa-solid fa-xmark"></i>@endif
				@elseif($userfield->type == \Grocy\Services\UserfieldsService::USERFIELD_TYPE_PRESET_CHECKLIST)
				<ul class="mb-0 pl-0"
					style="list-style-position: inside;">
					@foreach(explode(',', $value) as $item)
					<li>{{ $item }}</li>
					@endforeach
				</ul>
				@elseif($userfield->type == \Grocy\Services\UserfieldsService::USERFIELD_TYPE_LINK)
				<a href="{{ $value }}"
					class="text-primary"
					target="_blank">{{ $value }}</a>
				@elseif($userfield->type == \Grocy\Services\UserfieldsService::USERFIELD_TYPE_LINK_WITH_TITLE)
				@php
				$title = '';
				$link = '';
				if(!empty($value))
				{
				$data = json_decode($value);
				$title = $data->title;
				$link = $data->link;
				}
				@endphp
				<a href="{{ $link }}"
					class="text-primary"
					target="_blank">{{ $title }}</a>
				@elseif($userfield->type == \Grocy\Services\UserfieldsService::USERFIELD_TYPE_FILE && !empty($value))
				<a href="{{ $U('/files/userfiles/'. $value) }}"
					target="_blank"
					class="btn btn-sm btn-primary">{{ base64_decode(explode('_', $value)[1]) }}</a>
				@elseif($userfield->type == \Grocy\Services\UserfieldsService::USERFIELD_TYPE_IMAGE && !empty($value))
				<a href="{{ $U('/files/userfiles/'. $value) }}"
					target="_blank">
					<img src="{{ $U('/files/userfiles/'. $value . '?force_serve_as=picture&best_fit_width=64&best_fit_height=64') }}"
						title="{{ base64_decode(explode('_', $value)[1]) }}"
						alt="{{ base64_decode(explode('_', $value)[1]) }}"
						loading="lazy"
						class="img-thumbnail">
				</a>
				@elseif($userfield->type == \Grocy\Services\UserfieldsService::USERFIELD_TYPE_NUMBER_DECIMAL)
				<span class="locale-number locale-number-generic">{{ $value }}</span>
				@elseif($userfield->type == \Grocy\Services\UserfieldsService::USERFIELD_TYPE_NUMBER_CURRENCY)
				<span class="locale-number locale-number-currency">{{ $value }}</span>
				@elseif($userfield->type == \Grocy\Services\UserfieldsService::USERFIELD_TYPE_DATE)
				<span class="userfield-date-format">{{ $value }}</span>
				@elseif($userfield->type == \Grocy\Services\UserfieldsService::USERFIELD_TYPE_DATETIME)
				<span class="userfield-datetime-format">{{ $value }}</span>
				@elseif($userfield->type == \Grocy\Services\UserfieldsService::USERFIELD_TYPE_SINGLE_MULTILINE_TEXT)
				{!! nl2br(e($value)) !!}
				@else
				{{ $value }}
				@endif
			</td>
		</tr>
		@endforeach
	</table>
</div>
@endif
