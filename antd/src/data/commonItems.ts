/**
 * 常用物品数据配置
 */

export interface CommonItem {
  id: string;
  name: string;
  type?: string;
  rarity?: string;
  category: string;
  subCategory?: string;
}

export interface CommonItemCategory {
  key: string;
  name: string;
  icon?: string;
  color?: string;
  items: CommonItem[];
}

// 90史诗武器
const epic90Weapons: CommonItem[] = [
  { id: '2010000', name: '妖刀村正', category: '90史诗武器', type: '装备', rarity: '史诗' },
  { id: '2011001', name: '圣剑:王者之剑', category: '90史诗武器', type: '装备', rarity: '史诗' },
  { id: '2011002', name: '暗影蔽日', category: '90史诗武器', type: '装备', rarity: '史诗' },
  { id: '2011003', name: '死亡冰柱', category: '90史诗武器', type: '装备', rarity: '史诗' },
  { id: '2011004', name: '世界的支点', category: '90史诗武器', type: '装备', rarity: '史诗' },
  { id: '2011005', name: '永恒守护', category: '90史诗武器', type: '装备', rarity: '史诗' },
  { id: '2011006', name: '贝兹女王的荣耀之拳', category: '90史诗武器', type: '装备', rarity: '史诗' },
  { id: '2011007', name: '黑月狼牙', category: '90史诗武器', type: '装备', rarity: '史诗' },
  { id: '2011008', name: '纵横百战', category: '90史诗武器', type: '装备', rarity: '史诗' },
  { id: '2011009', name: '战神克星', category: '90史诗武器', type: '装备', rarity: '史诗' },
  { id: '2011010', name: '离子驱逐者', category: '90史诗武器', type: '装备', rarity: '史诗' },
  { id: '2011011', name: '地狱浩劫', category: '90史诗武器', type: '装备', rarity: '史诗' },
  { id: '2011012', name: '乌尔班攻城巨炮', category: '90史诗武器', type: '装备', rarity: '史诗' },
  { id: '2011013', name: '代号N', category: '90史诗武器', type: '装备', rarity: '史诗' },
  { id: '2011014', name: '金色闪光-神谕', category: '90史诗武器', type: '装备', rarity: '史诗' },
  { id: '2011015', name: '无形魔镜', category: '90史诗武器', type: '装备', rarity: '史诗' },
  { id: '2011016', name: '世事不可强求 - 闭环', category: '90史诗武器', type: '装备', rarity: '史诗' },
  { id: '2011017', name: '宇宙真理', category: '90史诗武器', type: '装备', rarity: '史诗' },
  { id: '2011018', name: '辉煌耀世', category: '90史诗武器', type: '装备', rarity: '史诗' },
  { id: '2011019', name: '威利：无限破坏者', category: '90史诗武器', type: '装备', rarity: '史诗' },
  { id: '2011020', name: '星际毁灭', category: '90史诗武器', type: '装备', rarity: '史诗' },
  { id: '2011021', name: '神王的雷电十字架', category: '90史诗武器', type: '装备', rarity: '史诗' },
  { id: '2011022', name: '阴阳四天', category: '90史诗武器', type: '装备', rarity: '史诗' },
  { id: '2011023', name: '灵魂剥离', category: '90史诗武器', type: '装备', rarity: '史诗' },
  { id: '2011024', name: '先祖庇护之柱', category: '90史诗武器', type: '装备', rarity: '史诗' },
  { id: '2011025', name: '月影霜风', category: '90史诗武器', type: '装备', rarity: '史诗' },
  { id: '2011026', name: '冰火清影', category: '90史诗武器', type: '装备', rarity: '史诗' },
  { id: '2011027', name: '霍克莫特教务长', category: '90史诗武器', type: '装备', rarity: '史诗' },
];

// 90史诗首饰
const epic90Accessories: CommonItem[] = [
  { id: '100300733', name: '氤氲之息', category: '90史诗首饰', type: '装备', rarity: '史诗' },
  { id: '100300732', name: '天空的里程碑 - 坤', category: '90史诗首饰', type: '装备', rarity: '史诗' },
  { id: '100300731', name: '冥狱锁魂项链', category: '90史诗首饰', type: '装备', rarity: '史诗' },
  { id: '100322293', name: '天空的引路人：勒马', category: '90史诗首饰', type: '装备', rarity: '史诗' },
  { id: '100322294', name: '清泉流馨', category: '90史诗首饰', type: '装备', rarity: '史诗' },
  { id: '100322292', name: '碧水重门指环', category: '90史诗首饰', type: '装备', rarity: '史诗' },
  { id: '100312424', name: '天空的灯塔 - 王夫', category: '90史诗首饰', type: '装备', rarity: '史诗' },
  { id: '100312425', name: '启明星的指引', category: '90史诗首饰', type: '装备', rarity: '史诗' },
  { id: '100312423', name: '超级赛亚人的手镯', category: '90史诗首饰', type: '装备', rarity: '史诗' },
];

// 90史诗左右槽
const epic90Slots: CommonItem[] = [
  { id: '100344509', name: '鱼雕坠饰', category: '90史诗左右槽', type: '装备', rarity: '史诗' },
  { id: '100344510', name: '黑白境界-假面', category: '90史诗左右槽', type: '装备', rarity: '史诗' },
  { id: '100344511', name: '波利斯的黄金杯', category: '90史诗左右槽', type: '装备', rarity: '史诗' },
  { id: '100352813', name: '非缄默之石', category: '90史诗左右槽', type: '装备', rarity: '史诗' },
  { id: '100352814', name: '杰克爆弹的记忆', category: '90史诗左右槽', type: '装备', rarity: '史诗' },
  { id: '100352815', name: '冰霜雪人的记忆', category: '90史诗左右槽', type: '装备', rarity: '史诗' },
  { id: '100352818', name: '光电鳗的记忆', category: '90史诗左右槽', type: '装备', rarity: '史诗' },
  { id: '100352819', name: '暗影夜猫的记忆', category: '90史诗左右槽', type: '装备', rarity: '史诗' },
  { id: '100352820', name: '卡巴拉的记忆', category: '90史诗左右槽', type: '装备', rarity: '史诗' },
  { id: '100352821', name: '黑白境界-灵魂', category: '90史诗左右槽', type: '装备', rarity: '史诗' },
  { id: '100352822', name: '罗塞塔石碑', category: '90史诗左右槽', type: '装备', rarity: '史诗' },
];

// 90史诗套装
const epic90Sets: CommonItem[] = [
  { id: '100200553', name: '上元节朴素腰带', category: '90史诗套装', type: '装备', rarity: '史诗' },
  { id: '100050697', name: '上元节朴素上衣', category: '90史诗套装', type: '装备', rarity: '史诗' },
  { id: '100100609', name: '上元节朴素长裙', category: '90史诗套装', type: '装备', rarity: '史诗' },
  { id: '100250572', name: '上元节朴素鞋子', category: '90史诗套装', type: '装备', rarity: '史诗' },
  { id: '100150578', name: '上元节朴素肩膀', category: '90史诗套装', type: '装备', rarity: '史诗' },
  { id: '100210549', name: '时光的轨迹腰带', category: '90史诗套装', type: '装备', rarity: '史诗' },
  { id: '100060598', name: '时光的轨迹上衣', category: '90史诗套装', type: '装备', rarity: '史诗' },
  { id: '100110584', name: '时光的轨迹裤子', category: '90史诗套装', type: '装备', rarity: '史诗' },
  { id: '100260565', name: '时光的轨迹鞋子', category: '90史诗套装', type: '装备', rarity: '史诗' },
  { id: '100160525', name: '时光的轨迹肩膀', category: '90史诗套装', type: '装备', rarity: '史诗' },
  { id: '100220518', name: '万世荣光腰带', category: '90史诗套装', type: '装备', rarity: '史诗' },
  { id: '100070550', name: '万世荣光上衣', category: '90史诗套装', type: '装备', rarity: '史诗' },
  { id: '100120543', name: '万世荣光裤子', category: '90史诗套装', type: '装备', rarity: '史诗' },
  { id: '100270514', name: '万世荣光鞋子', category: '90史诗套装', type: '装备', rarity: '史诗' },
  { id: '100170518', name: '万世荣光肩膀', category: '90史诗套装', type: '装备', rarity: '史诗' },
  { id: '100230479', name: '铁马长戈腰带', category: '90史诗套装', type: '装备', rarity: '史诗' },
  { id: '100080525', name: '铁马长戈上衣', category: '90史诗套装', type: '装备', rarity: '史诗' },
  { id: '100130511', name: '铁马长戈裤子', category: '90史诗套装', type: '装备', rarity: '史诗' },
  { id: '100280474', name: '铁马长戈鞋子', category: '90史诗套装', type: '装备', rarity: '史诗' },
  { id: '100180479', name: '铁马长戈肩膀', category: '90史诗套装', type: '装备', rarity: '史诗' },
  { id: '100240340', name: '星辰之命运腰带', category: '90史诗套装', type: '装备', rarity: '史诗' },
  { id: '100090367', name: '星辰之命运上衣', category: '90史诗套装', type: '装备', rarity: '史诗' },
  { id: '100140362', name: '星辰之命运下装', category: '90史诗套装', type: '装备', rarity: '史诗' },
  { id: '100290353', name: '星辰之命运鞋子', category: '90史诗套装', type: '装备', rarity: '史诗' },
  { id: '100190333', name: '星辰之命运肩膀', category: '90史诗套装', type: '装备', rarity: '史诗' },
];

// 荒古系列
const ancientSeries: CommonItem[] = [
  { id: '101000497', name: '荒古遗尘短剑', category: '荒古系列', type: '装备', rarity: '史诗' },
  { id: '101010653', name: '荒古遗尘太刀', category: '荒古系列', type: '装备', rarity: '史诗' },
  { id: '101020459', name: '荒古遗尘骨棒', category: '荒古系列', type: '装备', rarity: '史诗' },
  { id: '101030517', name: '荒古遗尘巨剑', category: '荒古系列', type: '装备', rarity: '史诗' },
  { id: '101040332', name: '荒古遗尘光剑', category: '荒古系列', type: '装备', rarity: '史诗' },
  { id: '102000327', name: '荒古遗尘手套', category: '荒古系列', type: '装备', rarity: '史诗' },
  { id: '102010392', name: '荒古遗尘臂铠', category: '荒古系列', type: '装备', rarity: '史诗' },
  { id: '102020300', name: '荒古遗尘利爪', category: '荒古系列', type: '装备', rarity: '史诗' },
  { id: '102030331', name: '荒古遗尘拳套', category: '荒古系列', type: '装备', rarity: '史诗' },
  { id: '102040364', name: '荒古遗尘东方棍', category: '荒古系列', type: '装备', rarity: '史诗' },
  { id: '104000341', name: '荒古遗尘左轮枪', category: '荒古系列', type: '装备', rarity: '史诗' },
  { id: '104010322', name: '荒古遗尘自动手枪', category: '荒古系列', type: '装备', rarity: '史诗' },
  { id: '104020323', name: '荒古遗尘步枪', category: '荒古系列', type: '装备', rarity: '史诗' },
  { id: '104030327', name: '荒古遗尘手炮', category: '荒古系列', type: '装备', rarity: '史诗' },
  { id: '104040343', name: '荒古遗尘手弩', category: '荒古系列', type: '装备', rarity: '史诗' },
  { id: '106000279', name: '荒古遗尘战矛', category: '荒古系列', type: '装备', rarity: '史诗' },
  { id: '106010307', name: '荒古遗尘长棍', category: '荒古系列', type: '装备', rarity: '史诗' },
  { id: '106020368', name: '荒古遗尘魔杖', category: '荒古系列', type: '装备', rarity: '史诗' },
  { id: '106030403', name: '荒古遗尘法杖', category: '荒古系列', type: '装备', rarity: '史诗' },
  { id: '106040284', name: '荒古遗尘扫把', category: '荒古系列', type: '装备', rarity: '史诗' },
  { id: '108000315', name: '荒古遗尘十字架', category: '荒古系列', type: '装备', rarity: '史诗' },
  { id: '108020261', name: '荒古遗尘图腾', category: '荒古系列', type: '装备', rarity: '史诗' },
  { id: '108030320', name: '荒古遗尘战镰', category: '荒古系列', type: '装备', rarity: '史诗' },
  { id: '108040275', name: '荒古遗尘战斧', category: '荒古系列', type: '装备', rarity: '史诗' },
  { id: '108010285', name: '荒古遗尘念珠', category: '荒古系列', type: '装备', rarity: '史诗' },
  { id: '109000262', name: '荒古遗尘匕首', category: '荒古系列', type: '装备', rarity: '史诗' },
  { id: '109010251', name: '荒古遗尘双剑', category: '荒古系列', type: '装备', rarity: '史诗' },
  { id: '109030148', name: '荒古遗尘权杖', category: '荒古系列', type: '装备', rarity: '史诗' },
];

// 二觉称号
const awakeningTitles: CommonItem[] = [
  { id: '120688525', name: '瞎狗', category: '二觉称号', type: '称号', rarity: '史诗' },
  { id: '120688526', name: '白狗', category: '二觉称号', type: '称号', rarity: '史诗' },
  { id: '120688527', name: '黑狗', category: '二觉称号', type: '称号', rarity: '史诗' },
  { id: '120688528', name: '红狗', category: '二觉称号', type: '称号', rarity: '史诗' },
];

// 黑岩套装
const blackRockSets: CommonItem[] = [
  { id: '3000027', name: '妄想的偏执狂战袍', category: '黑岩套装', type: '装备', rarity: '史诗' },
  { id: '3000030', name: '崩坏的二次元之鞋', category: '黑岩套装', type: '装备', rarity: '史诗' },
  { id: '3000029', name: '人格的伪装者面具', category: '黑岩套装', type: '装备', rarity: '史诗' },
  { id: '3000028', name: '执着的自恋狂护腿', category: '黑岩套装', type: '装备', rarity: '史诗' },
  { id: '3000026', name: '死亡的进行曲腰带', category: '黑岩套装', type: '装备', rarity: '史诗' },
  { id: '3000042', name: '虚无之空间胸甲', category: '黑岩套装', type: '装备', rarity: '史诗' },
  { id: '3000045', name: '欧格罗斯的贪食之痕', category: '黑岩套装', type: '装备', rarity: '史诗' },
  { id: '3000044', name: '布兰兹的业火战靴', category: '黑岩套装', type: '装备', rarity: '史诗' },
  { id: '3000043', name: '斯狄尔的超合金护腕', category: '黑岩套装', type: '装备', rarity: '史诗' },
  { id: '3000041', name: '维波的凝滞腰带', category: '黑岩套装', type: '装备', rarity: '史诗' },
  { id: '3000037', name: '瓦巴拉的大地', category: '黑岩套装', type: '装备', rarity: '史诗' },
  { id: '3000040', name: '潘诺西亚的火山', category: '黑岩套装', type: '装备', rarity: '史诗' },
  { id: '3000039', name: '凯诺兰的地壳', category: '黑岩套装', type: '装备', rarity: '史诗' },
  { id: '3000038', name: '盘古大陆的地震', category: '黑岩套装', type: '装备', rarity: '史诗' },
  { id: '3000036', name: '罗迪尼亚的熔岩', category: '黑岩套装', type: '装备', rarity: '史诗' },
  { id: '3000032', name: '逆鳞之摩那斯之角', category: '黑岩套装', type: '装备', rarity: '史诗' },
  { id: '3000035', name: '海龙王娑伽罗之尾', category: '黑岩套装', type: '装备', rarity: '史诗' },
  { id: '3000034', name: '青莲优钵罗的祝福', category: '黑岩套装', type: '装备', rarity: '史诗' },
  { id: '3000033', name: '乳海搅拌的婆苏吉', category: '黑岩套装', type: '装备', rarity: '史诗' },
  { id: '3000031', name: '刺杀者德叉伽的尖牙', category: '黑岩套装', type: '装备', rarity: '史诗' },
  { id: '3000047', name: '傲慢之眼', category: '黑岩套装', type: '装备', rarity: '史诗' },
  { id: '3000050', name: '贪婪之手', category: '黑岩套装', type: '装备', rarity: '史诗' },
  { id: '3000049', name: '怠惰之足', category: '黑岩套装', type: '装备', rarity: '史诗' },
  { id: '3000048', name: '暴食之口', category: '黑岩套装', type: '装备', rarity: '史诗' },
  { id: '3000046', name: '妒忌之舌', category: '黑岩套装', type: '装备', rarity: '史诗' },
  { id: '3000023', name: '王座本源', category: '黑岩套装', type: '装备', rarity: '史诗' },
  { id: '3000025', name: '黑暗祭礼', category: '黑岩套装', type: '装备', rarity: '史诗' },
  { id: '3000024', name: '王冠非冠', category: '黑岩套装', type: '装备', rarity: '史诗' },
  { id: '100352107', name: '源助力-艾格尼丝', category: '黑岩套装', type: '装备', rarity: '史诗' },
  { id: '100343176', name: '源助力-洛克', category: '黑岩套装', type: '装备', rarity: '史诗' },
];

// 材料&消耗品
const materialsAndConsumables: CommonItem[] = [
  { id: '10000801', name: '5%12卷', category: '材料&消耗品', type: '消耗品', rarity: '普通' },
  { id: '10000802', name: '15%12卷', category: '材料&消耗品', type: '消耗品', rarity: '普通' },
  { id: '10000803', name: '30%12卷', category: '材料&消耗品', type: '消耗品', rarity: '普通' },
  { id: '10000804', name: '50%12卷', category: '材料&消耗品', type: '消耗品', rarity: '普通' },
  { id: '10000805', name: '5%13卷', category: '材料&消耗品', type: '消耗品', rarity: '普通' },
  { id: '10000806', name: '15%13卷', category: '材料&消耗品', type: '消耗品', rarity: '普通' },
  { id: '10000807', name: '30%13卷', category: '材料&消耗品', type: '消耗品', rarity: '普通' },
  { id: '10000808', name: '50%13卷', category: '材料&消耗品', type: '消耗品', rarity: '普通' },
  { id: '3823', name: '精炼的时空石', category: '材料&消耗品', type: '材料', rarity: '稀有' },
  { id: '3262', name: '金色小晶块', category: '材料&消耗品', type: '材料', rarity: '普通' },
  { id: '3826', name: '光之根源', category: '材料&消耗品', type: '材料', rarity: '稀有' },
  { id: '3825', name: '暗之根源', category: '材料&消耗品', type: '材料', rarity: '稀有' },
  { id: '3824', name: '魔岩石', category: '材料&消耗品', type: '材料', rarity: '稀有' },
  { id: '3330', name: '深渊派对邀请函', category: '材料&消耗品', type: '消耗品', rarity: '稀有' },
  { id: '3500', name: '梦幻结晶', category: '材料&消耗品', type: '材料', rarity: '稀有' },
  { id: '3037', name: '无色小晶块', category: '材料&消耗品', type: '材料', rarity: '普通' },
  { id: '3033', name: '黑色小晶块', category: '材料&消耗品', type: '材料', rarity: '普通' },
  { id: '3034', name: '白色小晶块', category: '材料&消耗品', type: '材料', rarity: '普通' },
  { id: '3035', name: '红色小晶块', category: '材料&消耗品', type: '材料', rarity: '普通' },
  { id: '3036', name: '蓝色小晶块', category: '材料&消耗品', type: '材料', rarity: '普通' },
  { id: '3038', name: '黑色大晶体', category: '材料&消耗品', type: '材料', rarity: '普通' },
  { id: '3039', name: '白色大晶体', category: '材料&消耗品', type: '材料', rarity: '普通' },
  { id: '3040', name: '红色大晶体', category: '材料&消耗品', type: '材料', rarity: '普通' },
  { id: '3041', name: '蓝色大晶体', category: '材料&消耗品', type: '材料', rarity: '普通' },
  { id: '3042', name: '无色大晶体', category: '材料&消耗品', type: '材料', rarity: '普通' },
  { id: '3263', name: '金色大晶体', category: '材料&消耗品', type: '材料', rarity: '普通' },
  { id: '1039', name: '力量之石', category: '材料&消耗品', type: '材料', rarity: '普通' },
  { id: '1040', name: '智慧之石', category: '材料&消耗品', type: '材料', rarity: '普通' },
  { id: '1041', name: '体力之石', category: '材料&消耗品', type: '材料', rarity: '普通' },
  { id: '1042', name: '精神之石', category: '材料&消耗品', type: '材料', rarity: '普通' },
  { id: '1043', name: '生命之石', category: '材料&消耗品', type: '材料', rarity: '普通' },
  { id: '1044', name: '魔力之石', category: '材料&消耗品', type: '材料', rarity: '普通' },
  { id: '1045', name: '速度之石', category: '材料&消耗品', type: '材料', rarity: '普通' },
  { id: '1046', name: '抗性之石', category: '材料&消耗品', type: '材料', rarity: '普通' },
  { id: '3338', name: '闪耀的陨石', category: '材料&消耗品', type: '材料', rarity: '稀有' },
  { id: '3821', name: '宇宙灵魂', category: '材料&消耗品', type: '材料', rarity: '史诗' },
  { id: '3284', name: '耀眼的宇宙灵魂', category: '材料&消耗品', type: '材料', rarity: '史诗' },
  { id: '3285', name: '透明的宇宙灵魂', category: '材料&消耗品', type: '材料', rarity: '史诗' },
  { id: '3257', name: '黯淡的宇宙灵魂', category: '材料&消耗品', type: '材料', rarity: '史诗' },
  { id: '3258', name: '闪亮的宇宙灵魂', category: '材料&消耗品', type: '材料', rarity: '史诗' },
  { id: '3259', name: '华丽的宇宙灵魂', category: '材料&消耗品', type: '材料', rarity: '史诗' },
  { id: '3260', name: '灿烂的宇宙灵魂', category: '材料&消耗品', type: '材料', rarity: '史诗' },
];

// 常用物品分类配置
export const COMMON_ITEM_CATEGORIES: CommonItemCategory[] = [
  {
    key: 'epic90Weapons',
    name: '90史诗武器',
    icon: '⚔️',
    color: '#ff4d4f',
    items: epic90Weapons,
  },
  {
    key: 'epic90Accessories',
    name: '90史诗首饰',
    icon: '💍',
    color: '#722ed1',
    items: epic90Accessories,
  },
  {
    key: 'epic90Slots',
    name: '90史诗左右槽',
    icon: '🔮',
    color: '#1890ff',
    items: epic90Slots,
  },
  {
    key: 'epic90Sets',
    name: '90史诗套装',
    icon: '👕',
    color: '#52c41a',
    items: epic90Sets,
  },
  {
    key: 'ancientSeries',
    name: '荒古系列',
    icon: '🗡️',
    color: '#fa8c16',
    items: ancientSeries,
  },
  {
    key: 'awakeningTitles',
    name: '二觉称号',
    icon: '🏆',
    color: '#eb2f96',
    items: awakeningTitles,
  },
  {
    key: 'blackRockSets',
    name: '黑岩套装',
    icon: '🛡️',
    color: '#13c2c2',
    items: blackRockSets,
  },
  {
    key: 'materialsAndConsumables',
    name: '材料&消耗品',
    icon: '📦',
    color: '#faad14',
    items: materialsAndConsumables,
  },
];

// 获取所有常用物品
export const getAllCommonItems = (): CommonItem[] => {
  return COMMON_ITEM_CATEGORIES.reduce((acc, category) => {
    return acc.concat(category.items);
  }, [] as CommonItem[]);
};

// 根据分类获取物品
export const getItemsByCategory = (categoryKey: string): CommonItem[] => {
  const category = COMMON_ITEM_CATEGORIES.find(cat => cat.key === categoryKey);
  return category ? category.items : [];
};

// 搜索常用物品
export const searchCommonItems = (keyword: string): CommonItem[] => {
  if (!keyword.trim()) return [];

  const lowerKeyword = keyword.toLowerCase();
  return getAllCommonItems().filter(item =>
    item.name.toLowerCase().includes(lowerKeyword) ||
    item.id.includes(keyword) ||
    item.category.toLowerCase().includes(lowerKeyword)
  );
};

// 根据ID获取物品信息
export const getCommonItemById = (id: string): CommonItem | undefined => {
  return getAllCommonItems().find(item => item.id === id);
};