import * as fs from "fs/promises";
import * as path from "path";
import fetch from "node-fetch";

// Initialize Supabase connection
const projectId = "xwzcurcposvfbiilrqck";
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3emN1cmNwb3N2ZmJpaWxycWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMjQ3MTEsImV4cCI6MjA2NTkwMDcxMX0.f6h7Sdmp9-5dizI5JSjzjiNe-Jsmi9r0awdrLMafpiI";

// Property type mapping
const propertyTypeMap: { [key: string]: string } = {
  "1": "Maison",
  "2": "Appartement",
  "3": "Dépendance",
  "4": "Local industriel. commercial ou assimilé",
};

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase key length:", supabaseKey?.length || 0);

interface Property {
  id?: number;
  external_id: string;
  address: string;
  city: string;
  postal_code: string;
  property_type: string;
  rooms: number | null;
  area: number;
  latitude: number | null;
  longitude: number | null;
}

interface Transaction {
  property_key: string;
  price: number;
  transaction_date: string;
}

async function verifyConnection() {
  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/properties?select=count`,
      {
        method: "HEAD",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    );

    return response.ok;
  } catch (error) {
    console.error("Connection verification failed:", error);
    return false;
  }
}

async function clearExistingData() {
  try {
    // First delete price history (due to foreign key constraint)
    await fetch(`${supabaseUrl}/rest/v1/price_history?id=neq.0`, {
      method: "DELETE",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    // Then delete properties
    const response = await fetch(`${supabaseUrl}/rest/v1/properties?id=neq.0`, {
      method: "DELETE",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return { error: null };
  } catch (error) {
    return { error };
  }
}

async function insertProperties(properties: Property[]) {
  try {
    console.log("Sample property being sent:", properties[0]);
    const response = await fetch(`${supabaseUrl}/rest/v1/properties`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(properties),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const data = (await response.json()) as Property[];
    console.log("Sample property received:", data[0]);
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

async function insertPriceHistory(
  transactions: Transaction[],
  propertyMap: Map<string, number>
) {
  try {
    // Combine transactions for the same property on the same date
    const combinedTransactions = new Map<
      string,
      { property_id: number; price: number; transaction_date: string }
    >();

    transactions.forEach((t) => {
      const propertyId = propertyMap.get(t.property_key);
      if (!propertyId) return;

      const key = `${propertyId}-${t.transaction_date}`;
      const existing = combinedTransactions.get(key);

      if (existing) {
        existing.price += t.price;
      } else {
        combinedTransactions.set(key, {
          property_id: propertyId,
          price: t.price,
          transaction_date: t.transaction_date,
        });
      }
    });

    const priceHistory = Array.from(combinedTransactions.values());

    const response = await fetch(`${supabaseUrl}/rest/v1/price_history`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(priceHistory),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return { error: null };
  } catch (error) {
    return { error };
  }
}

async function importProperties() {
  try {
    console.log("Verifying Supabase connection...");
    const isConnected = await verifyConnection();
    if (!isConnected) {
      console.error(
        "Failed to connect to Supabase. Please check your credentials and try again."
      );
      return;
    }

    console.log("Clearing existing data...");
    const { error: clearError } = await clearExistingData();
    if (clearError) {
      console.error("Failed to clear existing data:", clearError);
      return;
    }

    const filePath = path.join(
      process.cwd(),
      "../src/data/ValeursFoncieres-2024.txt"
    );
    console.log("Looking for file at:", filePath);

    const fileExists = await fs
      .access(filePath)
      .then(() => true)
      .catch(() => false);
    if (!fileExists) {
      console.error("File not found at:", filePath);
      return;
    }

    console.log("Reading file...");
    const fileContent = await fs.readFile(filePath, "utf-8");
    const lines = fileContent.split("\n");
    console.log(`Found ${lines.length} lines in file`);

    // Field indexes from header:
    // Date mutation: 8
    // Valeur fonciere: 10
    // No voie: 11
    // Type de voie: 13
    // Voie: 15
    // Code postal: 16
    // Commune: 17
    // Type local: 35
    // Surface reelle bati: 39
    // Nombre pieces principales: 40

    console.log("Processing properties...");
    const propertyMap = new Map<string, Property>();
    const transactions: Transaction[] = [];
    let ivryCount = 0;

    // Skip header
    for (let i = 1; i < lines.length; i++) {
      const fields = lines[i].split("|");

      // Check if it's in Ivry (94200)
      const postalCode = fields[16]?.trim();
      const city = fields[17]?.trim();

      if (postalCode === "94200" && city === "IVRY-SUR-SEINE") {
        ivryCount++;
        // Parse the date
        const dateParts = fields[8]?.trim().split("/");
        if (!dateParts || dateParts.length !== 3) continue;

        const propertyDate = new Date(
          `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
        );

        // Get the address components
        const streetNumber = fields[11]?.trim() || "";
        const streetType = fields[13]?.trim() || "";
        const streetName = fields[15]?.trim() || "";

        // Construct full address
        const addressParts = [streetNumber, streetType, streetName].filter(
          Boolean
        );
        const address = addressParts.join(" ");

        // Parse price (replace comma with dot for French number format)
        const price = parseFloat(fields[10]?.replace(/,/g, ".")) || 0;

        // Get property type
        const rawType = fields[35]?.trim() || "";
        const propertyType = propertyTypeMap[rawType] || "Unknown type";

        // Get area from Surface reelle bati (field 39)
        const areaStr = fields[39]?.trim();
        const areaValue = areaStr
          ? parseFloat(areaStr.replace(",", "."))
          : null;

        if (
          price > 0 &&
          address &&
          areaValue &&
          areaValue > 0 &&
          (propertyType === "Appartement" || propertyType === "Maison")
        ) {
          // Create a unique key for this property unit
          const propertyKey = `${address}|${propertyType}|${areaValue}`;

          // Store unique property
          if (!propertyMap.has(propertyKey)) {
            propertyMap.set(propertyKey, {
              external_id: `${i}`,
              address,
              city: "IVRY-SUR-SEINE",
              postal_code: "94200",
              property_type: propertyType,
              rooms: parseInt(fields[40]?.trim()) || null,
              area: areaValue,
              latitude: null,
              longitude: null,
            });
          }

          // Store transaction
          transactions.push({
            property_key: propertyKey,
            price,
            transaction_date: propertyDate.toISOString().split("T")[0],
          });
        }
      }

      // Log progress for large file
      if (i % 100000 === 0) {
        console.log(`Scanned ${i} lines...`);
      }
    }

    const properties = Array.from(propertyMap.values());
    console.log(`Found ${ivryCount} properties in Ivry-sur-Seine`);
    console.log(`Found ${properties.length} unique properties`);
    console.log(`Found ${transactions.length} transactions`);

    // Insert properties first
    console.log("Inserting properties...");
    const { data: insertedProperties, error: propertiesError } =
      await insertProperties(properties);
    if (propertiesError) {
      console.error("Error inserting properties:", propertiesError);
      return;
    }

    // Create a map of property keys to their database IDs
    const propertyIdMap = new Map<string, number>();
    (insertedProperties as Property[]).forEach((prop) => {
      if (prop.id !== undefined) {
        const key = `${prop.address}|${prop.property_type}|${prop.area}`;
        propertyIdMap.set(key, prop.id);
      }
    });

    // Insert price history
    console.log("Inserting price history...");
    const { error: priceHistoryError } = await insertPriceHistory(
      transactions,
      propertyIdMap
    );
    if (priceHistoryError) {
      console.error("Error inserting price history:", priceHistoryError);
      return;
    }

    console.log("Import complete!");
  } catch (error) {
    console.error("Import failed:", error);
  }
}

importProperties();
