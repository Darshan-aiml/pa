import { NextRequest, NextResponse } from 'next/server';
import { getAllPackages, getPackageById } from '@/lib/db';
import { calculateDynamicPricing } from '@/lib/pricing';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const pkg = getPackageById(id);
      if (!pkg) {
        return NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 });
      }

      const pricing = calculateDynamicPricing({
        hotel_id: pkg.default_hotel_id,
        transport_id: pkg.default_transport_id,
        activity_ids: pkg.default_activity_ids,
        nights: pkg.default_nights,
        travelers: pkg.default_travelers,
        package_id: pkg.id,
      });

      return NextResponse.json({ success: true, package: pkg, pricing });
    }

    const packages = getAllPackages();
    // Attach default base pricing to each package
    const packagesWithPricing = packages.map((pkg) => {
      const pricing = calculateDynamicPricing({
        hotel_id: pkg.default_hotel_id,
        transport_id: pkg.default_transport_id,
        activity_ids: pkg.default_activity_ids,
        nights: pkg.default_nights,
        travelers: pkg.default_travelers,
        package_id: pkg.id,
      });
      return {
        ...pkg,
        base_pricing: pricing,
      };
    });

    return NextResponse.json({ success: true, packages: packagesWithPricing });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch packages';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
