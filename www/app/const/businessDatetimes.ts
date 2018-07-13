/**
 * @file		businessDatetimes.ts
 * @brief		取引時間
 * @author	choi sunwoo
 * @date		2017.07.21
 */

//
// #1078
// 取引時間
//
export const BusinessDatetimes = {
	// 東証株式、JASDAQ株式
	'1' : {
		timeZones : [
			{	name : "zone1",	use : false },
			{	name : "zone2",	use : true , dateOffset :  0, begin :  90000,	final : 110000, limit : 123000 },
			{	name : "zone3",	use : true , dateOffset :  0, begin : 123000,	final : 150000, limit : 240000 },
		]
	},
	// 旧・大証先物OP（一日）
	'4' : {
		timeZones : [
			{	name : "zone1",	use : true , dateOffset : -1, begin : 163000,	final : 200000, limit : 240000 },
			{	name : "zone2",	use : true , dateOffset :  0, begin :  90000,	final : 110000, limit : 123000 },
			{	name : "zone3",	use : true , dateOffset :  0, begin : 123000,	final : 150000, limit : 163000 },
		]
	},
	// 旧・大証先物OP（イブニング）
	'8' : {
		timeZones : [
		{	name : "zone1",	use : true , dateOffset : -1, begin : 163000,	final : 200000, limit : 240000 },
		{	name : "zone2",	use : false },
		{	name : "zone3",	use : false },
	]},
	// 東証株式（半日）、JASDAQ株式（半日）
	'11' : {
		timeZones : [
		{	name : "zone1",	use : false },
		{	name : "zone2",	use : true , dateOffset :  0, begin :  90000,	final : 110000, limit : 123000 },
		{	name : "zone3",	use : false },
	]},
	// 大証先物OP（半日）
	'13' : {
		timeZones : [
		{	name : "zone1",	use : true , dateOffset : -1, begin : 163000,	final : 200000, limit : 240000 },
		{	name : "zone2",	use : true , dateOffset :  0, begin :  90000,	final : 111000, limit : 123000 },
		{	name : "zone3",	use : false },
	]},
	// 大証先物OP（一日）
	'18' : {
		timeZones : [
		{	name : "zone1",	use : true , dateOffset : -1, begin : 163000,	final : 233000, limit : 240000 },
		{	name : "zone2",	use : true , dateOffset :  0, begin :  90000,	final : 110000, limit : 123000 },
		{	name : "zone3",	use : true , dateOffset :  0, begin : 123000,	final : 151000, limit : 163000 },
	]},
	// 大証先物OP（イブニング）
	'19' : {
		timeZones : [
		{	name : "zone1",	use : true , dateOffset : -1, begin : 163000,	final : 233000, limit : 240000 },
		{	name : "zone2",	use : false },
		{	name : "zone3",	use : false },
	]},
	// 新・大証先物OP（日中）
	'20' : {
		timeZones : [
		{	name : "zone1",	use : false },
		{	name : "zone2",	use : true , dateOffset :  0, begin :  90000,	final : 151500, limit : 163000 },
		{	name : "zone3",	use : false },
	]},
	// 新・大証先物OP（一日）
	'21' : {
		timeZones : [
		{	name : "zone1",	use : true , dateOffset : -1, begin : 163000,	final : 233000, limit : 240000 },
		{	name : "zone2",	use : true , dateOffset :  0, begin :  90000,	final : 151500, limit : 163000 },
		{	name : "zone3",	use : false },
	]},
	// 東証株式 前場延長
	'22' : {
		timeZones : [
		{	name : "zone1",	use : false },
		{	name : "zone2",	use : true , dateOffset :  0, begin :  90000,	final : 113000, limit : 123000 },
		{	name : "zone3",	use : true , dateOffset :  0, begin : 123000,	final : 150000, limit : 163000 },
	]},
	// 新・大証先物OP（一日）イブニング延長
	'24' : {
		timeZones : [
		{	name : "zone1",	use : true , dateOffset : -1, begin : 163000,	final : 270000, limit : 330000 },
		{	name : "zone2",	use : true , dateOffset :  0, begin :  90000,	final : 151500, limit : 163000 },
		{	name : "zone3",	use : false },
	]},
	// 大証先物OP（イブニング）延長
	'25' : {
		timeZones : [
		{	name : "zone1",	use : true , dateOffset : -1, begin : 163000,	final : 270000, limit : 330000 },
		{	name : "zone2",	use : false },
		{	name : "zone3",	use : false },
	]},
};

//
// #1078
// 取引時間
//
export const TimeZoneInfos = {
	// 株式
	'1' : {
		timeZones : [
			{	name : "zone1",	use : false },
			{	name : "zone2",	use : true , dateOffset :  0, begin :  90000,	final : 113000, limit : 123000 },
			{	name : "zone3",	use : true , dateOffset :  0, begin : 123000,	final : 150000, limit : 240000 },
		]
	},
	// 先物
	'2' : {
		timeZones : [
			{	name : "zone1",	use : true , dateOffset : -1, begin : 163000,	final : 293000, limit : 320000 },
			{	name : "zone2",	use : true , dateOffset :  0, begin :  84500,	final : 151500, limit : 163000 },
			{	name : "zone3",	use : false },
		]
	},
	// オプション
	'3' : {
		timeZones : [
			{	name : "zone1",	use : true , dateOffset : -1, begin : 163000,	final : 293000, limit : 320000 },
			{	name : "zone2",	use : true , dateOffset :  0, begin :  90000,	final : 151500, limit : 163000 },
			{	name : "zone3",	use : false },
	]},
	// #1446
	// 指数
	'4' : {
		timeZones : [
			{	name : "zone1",	use : true , dateOffset : -1, begin : 163000,	final : 293000, limit : 320000 },
			{	name : "zone2",	use : true , dateOffset :  0, begin :  84500,	final : 151500, limit : 163000 },
			{	name : "zone3",	use : false },
		]
	},
};
