export interface Product {
  id: string;
  slug: string;
  name: string;
  category: 'fertilizer' | 'pesticide';
  subCategory: string;
  brand: string;
  ingredients: string;
  suitableCrops: string[];
  dosage: string;
  price: number;
  pros: string[];
  cons: string[];
  rating: number;
  affiliateUrl: string;
  imageUrl: string;
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    slug: 'npk-phu-my-20-20-15',
    name: 'Phân bón NPK Phú Mỹ 20-20-15',
    category: 'fertilizer',
    subCategory: 'Phân bón NPK',
    brand: 'Phú Mỹ',
    ingredients: 'N: 20%, P2O5: 20%, K2O: 15%',
    suitableCrops: ['Lúa', 'Cây ăn trái', 'Rau màu'],
    dosage: '150-250 kg/ha mỗi đợt bón',
    price: 750000,
    pros: ['Hàm lượng dinh dưỡng cao', 'Dễ tan, cây hấp thụ nhanh'],
    cons: ['Dễ bị rửa trôi nếu mưa lớn'],
    rating: 4.8,
    affiliateUrl: 'https://shopee.vn',
    imageUrl: 'https://images.unsplash.com/photo-1615678815958-5910c6811c25?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'p2',
    slug: 'dau-trau-215',
    name: 'Phân bón Đầu Trâu NPK 21-5-6',
    category: 'fertilizer',
    subCategory: 'Phân bón NPK',
    brand: 'Bình Điền',
    ingredients: 'N: 21%, P2O5: 5%, K2O: 6%',
    suitableCrops: ['Lúa', 'Rau màu'],
    dosage: '200 kg/ha đợt đẻ nhánh',
    price: 680000,
    pros: ['Kích thích ra rễ, đẻ nhánh khỏe', 'Tiết kiệm chi phí'],
    cons: ['Không phù hợp giai đoạn nuôi trái'],
    rating: 4.5,
    affiliateUrl: 'https://shopee.vn',
    imageUrl: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'p3',
    slug: 'ridomil-gold-68wg',
    name: 'Thuốc trừ bệnh Ridomil Gold 68WG',
    category: 'pesticide',
    subCategory: 'Thuốc trừ bệnh',
    brand: 'Syngenta',
    ingredients: 'Mancozeb 640g/kg + Metalaxyl-M 40g/kg',
    suitableCrops: ['Sầu riêng', 'Cao su', 'Cà chua'],
    dosage: '50g cho bình 16-25 lít nước',
    price: 115000,
    pros: ['Tác dụng lưu dẫn cực mạnh', 'Trị sương mai, thối rễ cực tốt'],
    cons: ['Độc tính cao, cần trang bị bảo hộ'],
    rating: 4.9,
    affiliateUrl: 'https://shopee.vn',
    imageUrl: 'https://images.unsplash.com/photo-1590005024862-6b67679a29fb?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'p4',
    slug: 'anvil-5sc',
    name: 'Thuốc trừ nấm Anvil 5SC',
    category: 'pesticide',
    subCategory: 'Thuốc trừ nấm',
    brand: 'Syngenta',
    ingredients: 'Hexaconazole 50g/l',
    suitableCrops: ['Lúa', 'Cà phê', 'Cao su'],
    dosage: '20ml cho bình 16 lít nước',
    price: 85000,
    pros: ['Trị khô vằn, rỉ sắt hiệu quả', 'Giá thành rẻ'],
    cons: ['Cần phun phòng sớm để đạt hiệu quả'],
    rating: 4.6,
    affiliateUrl: 'https://shopee.vn',
    imageUrl: 'https://images.unsplash.com/photo-1530836361253-efad5c4ff877?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'p5',
    slug: 'humic-acid-powder',
    name: 'Phân hữu cơ Humic Acid Powder',
    category: 'fertilizer',
    subCategory: 'Phân hữu cơ',
    brand: 'USA',
    ingredients: 'Humic Acid 80%, K2O 10%',
    suitableCrops: ['Tất cả các loại cây trồng'],
    dosage: '1kg pha 800 lít nước tưới gốc',
    price: 190000,
    pros: ['Cải tạo đất tơi xốp', 'Kích thích ra rễ tơ trắng'],
    cons: ['Dạng bột dễ bay bụi'],
    rating: 4.7,
    affiliateUrl: 'https://shopee.vn',
    imageUrl: 'https://images.unsplash.com/photo-1599599810694-b5b37304c041?auto=format&fit=crop&w=300&q=80'
  }
];
