import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Generate slug from performer name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Get file extension from URL or content-type
function getExtension(url: string, contentType: string | null): string {
  const urlExt = url.split('.').pop()?.toLowerCase().split('?')[0];
  if (urlExt && ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(urlExt)) {
    return urlExt === 'jpeg' ? 'jpg' : urlExt;
  }
  
  if (contentType) {
    if (contentType.includes('jpeg') || contentType.includes('jpg')) return 'jpg';
    if (contentType.includes('png')) return 'png';
    if (contentType.includes('webp')) return 'webp';
    if (contentType.includes('gif')) return 'gif';
    if (contentType.includes('svg')) return 'svg';
  }
  
  return 'jpg';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { limit = 20, performerIds } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get performers with external image URLs
    let query = supabase
      .from('performers')
      .select('id, name, image_url')
      .like('image_url', 'https://%')
      .not('image_url', 'like', `${supabaseUrl}%`)
      .limit(limit);

    if (performerIds && performerIds.length > 0) {
      query = supabase
        .from('performers')
        .select('id, name, image_url')
        .in('id', performerIds)
        .like('image_url', 'https://%')
        .limit(limit);
    }

    const { data: performers, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching performers:', fetchError);
      return new Response(
        JSON.stringify({ success: false, error: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${performers?.length || 0} performers`);

    const results: any[] = [];

    for (const performer of performers || []) {
      try {
        if (!performer.image_url) {
          results.push({ name: performer.name, success: false, error: 'No image URL' });
          continue;
        }

        console.log(`Downloading image for: ${performer.name}`);

        // Download the image
        const imageResponse = await fetch(performer.image_url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; TixOrbit/1.0)',
          },
        });

        if (!imageResponse.ok) {
          console.log(`Failed to download: ${imageResponse.status}`);
          results.push({ name: performer.name, success: false, error: `Download failed: ${imageResponse.status}` });
          continue;
        }

        const contentType = imageResponse.headers.get('content-type');
        const imageData = await imageResponse.arrayBuffer();
        
        // Generate filename
        const slug = generateSlug(performer.name);
        const ext = getExtension(performer.image_url, contentType);
        const filename = `${slug}.${ext}`;

        console.log(`Uploading to storage: ${filename} (${imageData.byteLength} bytes)`);

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('performer-images')
          .upload(filename, imageData, {
            contentType: contentType || 'image/jpeg',
            upsert: true,
          });

        if (uploadError) {
          console.error(`Upload error for ${performer.name}:`, uploadError);
          results.push({ name: performer.name, success: false, error: uploadError.message });
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('performer-images')
          .getPublicUrl(filename);

        const publicUrl = urlData.publicUrl;

        // Update performer record
        const { error: updateError } = await supabase
          .from('performers')
          .update({ image_url: publicUrl })
          .eq('id', performer.id);

        if (updateError) {
          console.error(`Update error for ${performer.name}:`, updateError);
          results.push({ name: performer.name, success: false, error: updateError.message });
        } else {
          console.log(`Successfully cached: ${performer.name}`);
          results.push({ 
            name: performer.name, 
            success: true, 
            newUrl: publicUrl,
            size: imageData.byteLength,
          });
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (err) {
        console.error(`Error processing ${performer.name}:`, err);
        results.push({ name: performer.name, success: false, error: String(err) });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`Completed: ${successCount}/${results.length} performers cached`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        cached: successCount,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in cache-performer-images:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
