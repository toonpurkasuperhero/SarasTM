require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const data = require('./demo_products.json');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function seed() {
  console.log('Seeding demo data...');

  for (const artisanData of data) {
    const { products, ...artisanFields } = artisanData;

    let artisan;
    const { data: existing } = await supabase.from('artisans').select('id').eq('phone', artisanFields.phone).single();

    if (existing) {
      artisan = existing;
    } else {
      const { data: created, error } = await supabase.from('artisans').insert(artisanFields).select().single();
      if (error) { console.error('Artisan insert error:', error); continue; }
      artisan = created;
    }

    for (const product of products) {
      const { data: existingProduct } = await supabase.from('products').select('id').eq('title', product.title).eq('artisan_id', artisan.id).single();
      if (existingProduct) { console.log(`Skipping existing product: ${product.title}`); continue; }

      const { data: newProduct, error: productErr } = await supabase.from('products').insert({
        ...product,
        artisan_id: artisan.id,
      }).select().single();

      if (productErr) { console.error('Product insert error:', productErr); continue; }
      console.log(`Created: ${newProduct.title}`);
    }
  }

  console.log('Seed complete!');
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
