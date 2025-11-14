
class Grocycode
{
	constructor(productId, type)
	{
		this.productId = productId;
		this.type = type;
	}

	GetUrl(size)
	{
		return U('/product/' + this.productId + '/grocycode?size=' + size);
	}
}
