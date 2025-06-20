import { createClient } from "@/lib/supabase";
import { Property, PropertyFilter } from "@/types/property";

export class PropertyRepository {
  static async getAll(filter?: PropertyFilter): Promise<Property[]> {
    const supabase = createClient();
    let query = supabase.from("properties").select(`
        *,
        price_history (
          price,
          transaction_date
        )
      `);

    if (filter?.minPrice) {
      query = query.gte("price", filter.minPrice);
    }

    if (filter?.maxPrice) {
      query = query.lte("price", filter.maxPrice);
    }

    if (filter?.minArea) {
      query = query.gte("area", filter.minArea);
    }

    if (filter?.maxArea) {
      query = query.lte("area", filter.maxArea);
    }

    if (filter?.propertyTypes && filter.propertyTypes.length > 0) {
      query = query.in("property_type", filter.propertyTypes);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching properties:", error);
      throw error;
    }

    return data || [];
  }

  static async update(id: number, updates: Partial<Property>): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from("properties")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Error updating property:", error);
      throw error;
    }
  }

  async findAll(filter?: PropertyFilter): Promise<Property[]> {
    let query = createClient().from("properties").select(`
      *,
      price_history (
        price,
        transaction_date
      )
    `);

    if (filter) {
      if (filter.propertyTypes && filter.propertyTypes.length === 1) {
        query = query.eq("property_type", filter.propertyTypes[0]);
      } else if (filter.propertyTypes && filter.propertyTypes.length > 1) {
        query = query.in("property_type", filter.propertyTypes);
      }
      if (filter.minRooms) {
        query = query.gte("rooms", filter.minRooms);
      }
      if (filter.maxRooms) {
        query = query.lte("rooms", filter.maxRooms);
      }
      if (filter.minArea) {
        query = query.gte("area", filter.minArea);
      }
      if (filter.maxArea) {
        query = query.lte("area", filter.maxArea);
      }
    }

    const { data: properties, error } = await query;

    if (error) {
      console.error("Error fetching properties:", error);
      throw error;
    }

    // Apply price and date filters in memory since they relate to the price_history
    let filteredProperties = properties || [];

    if (filter) {
      if (
        filter.minPrice ||
        filter.maxPrice ||
        filter.startDate ||
        filter.endDate
      ) {
        filteredProperties = filteredProperties.filter((property) => {
          if (!property.price_history || property.price_history.length === 0) {
            return false;
          }

          // Sort price history by date (newest first)
          const sortedHistory = [...property.price_history].sort(
            (a, b) =>
              new Date(b.transaction_date).getTime() -
              new Date(a.transaction_date).getTime()
          );

          const latestPrice = sortedHistory[0].price;
          const transactionDate = new Date(sortedHistory[0].transaction_date);

          // Apply price filters
          if (filter.minPrice && latestPrice < filter.minPrice) {
            return false;
          }
          if (filter.maxPrice && latestPrice > filter.maxPrice) {
            return false;
          }

          // Apply date filters
          if (
            filter.startDate &&
            transactionDate < new Date(filter.startDate)
          ) {
            return false;
          }
          if (filter.endDate && transactionDate > new Date(filter.endDate)) {
            return false;
          }

          return true;
        });
      }
    }

    return filteredProperties;
  }

  async findById(id: number): Promise<Property | null> {
    const { data, error } = await createClient()
      .from("properties")
      .select(
        `
        *,
        price_history (
          price,
          transaction_date
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching property:", error);
      throw error;
    }

    return data;
  }

  async findByExternalId(externalId: string): Promise<Property | null> {
    const { data, error } = await createClient()
      .from("properties")
      .select("*")
      .eq("external_id", externalId)
      .single();

    if (error) {
      console.error("Error fetching property:", error);
      throw error;
    }

    return data;
  }

  async getPropertyTypes(): Promise<string[]> {
    const { data, error } = await createClient()
      .from("properties")
      .select("property_type")
      .then((result) => {
        if (result.error) throw result.error;
        const uniqueTypes = new Set(result.data.map((p) => p.property_type));
        return { data: Array.from(uniqueTypes).sort(), error: null };
      });

    if (error) {
      console.error("Error fetching property types:", error);
      throw error;
    }

    return data;
  }

  async getPriceRange(): Promise<{ min: number; max: number }> {
    const { data, error } = await createClient()
      .from("price_history")
      .select("price")
      .order("price", { ascending: true });

    if (error) {
      console.error("Error fetching price range:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      return { min: 0, max: 1000000 };
    }

    return {
      min: Math.floor(data[0].price),
      max: Math.ceil(data[data.length - 1].price),
    };
  }

  async getDateRange(): Promise<{ start: string; end: string }> {
    const { data, error } = await createClient()
      .from("price_history")
      .select("transaction_date")
      .order("transaction_date", { ascending: true });

    if (error) {
      console.error("Error fetching date range:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      const now = new Date();
      return {
        start: new Date(now.getFullYear() - 1, 0, 1)
          .toISOString()
          .split("T")[0],
        end: now.toISOString().split("T")[0],
      };
    }

    return {
      start: data[0].transaction_date.split("T")[0],
      end: data[data.length - 1].transaction_date.split("T")[0],
    };
  }
}
