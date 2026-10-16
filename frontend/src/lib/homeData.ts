import { promises as fs } from 'fs';
import path from 'path';
import { faUsers, faAward, faFileLines, faShip, faFlask, faTrophy } from '@fortawesome/free-solid-svg-icons';

// Hero section types
export type HeroButton = {
  text: string;
  href: string;
};

export type HeroData = {
  badge: string;
  title: string;
  titleHighlight: string;
  description: string;
  primaryButton: HeroButton;
  secondaryButton: HeroButton;
  // Hero'nun altındaki konum satırı (mono): "40°43′K 29°57′D · Başiskele"
  position: { label: string; coordinates: string };
};

// Club introduction types
export type ClubFeature = {
  title: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any; // FontAwesome icon
};

export type ClubIntroductionData = {
  title: string;
  description: string;
  features: ClubFeature[];
};

// Announcements types
export type AnnouncementsData = {
  title: string;
  description: string;
  viewAllText: string;
  viewAllHref: string;
};

// Publications types
export type PublicationsData = {
  title: string;
  description: string;
  viewAllText: string;
  viewAllHref: string;
};

// İDA bölümü: aracın alt sistemleri. image null ise teknik çizim (VehicleBlueprint) gösterilir;
// her alt sistemin anchor'u çizimdeki numaralı işaretin yeri.
export type VehicleAnchor = 'mast' | 'camera' | 'antenna' | 'hull' | 'propulsion' | 'power';

export type VehicleSubsystem = {
  anchor: VehicleAnchor;
  title: string;
  description: string;
  team: string;
};

export type VehicleData = {
  eyebrow: string;
  title: string;
  description: string;
  image: string | null;
  subsystems: VehicleSubsystem[];
  cta: HeroButton;
};

// Main home data type
export type HomeData = {
  hero: HeroData;
  clubIntroduction: ClubIntroductionData;
  vehicle: VehicleData;
  announcements: AnnouncementsData;
  publications: PublicationsData;
};

// Icon mapping
const iconMap: Record<string, typeof faUsers> = {
  faUsers,
  faAward,
  faFileLines,
  faShip,
  faFlask,
  faTrophy,
};

// Server-side function to get home page data
export async function getHomeData(): Promise<HomeData> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'home', 'data.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    // Map icon strings to actual FontAwesome icons for club features
    const featuresWithIcons = data.clubIntroduction.features.map((feature: { title: string; description: string; icon: string }) => ({
      ...feature,
      icon: iconMap[feature.icon] || faUsers
    }));
    
    return {
      ...data,
      clubIntroduction: {
        ...data.clubIntroduction,
        features: featuresWithIcons
      }
    };
  } catch (error) {
    console.error('Error fetching home data:', error);
    throw new Error('Home data could not be loaded');
  }
}
