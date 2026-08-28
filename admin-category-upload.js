(function(){
  'use strict';

  function getClient(){
    return window.glovaera?.client || window.GLOVAERA?.client || null;
  }

  function escapeHtml(value=''){
    return String(value).replace(/[&<>'"]/g, c => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;'
    }[c]));
  }

  function addStyles(){
    if(document.getElementById('glovaera-category-upload-styles')) return;
    const style = document.createElement('style');
    style.id = 'glovaera-category-upload-styles';
    style.textContent = `
      .glovaera-category-upload small{display:block;margin-top:7px;color:#8b747e;line-height:1.45;font-size:12px}
      .glovaera-category-upload input[type=file]{padding:10px 12px;background:#fff}
      .glovaera-category-upload-preview{display:flex;align-items:center;gap:10px;margin-top:10px;padding:8px;border:1px solid #eadfe4;border-radius:10px;background:#fbf8f2}
      .glovaera-category-upload-preview img{width:58px;height:58px;object-fit:cover;border-radius:8px;border:1px solid #e1d5db}
      .glovaera-category-upload-preview span{font-size:12px;color:#735f69;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    `;
    document.head.appendChild(style);
  }

  function enhanceCategoryForm(form){
    if(!form || form.dataset.categoryUploadReady === '1') return;
    form.dataset.categoryUploadReady = '1';
    addStyles();

    const urlInput = form.querySelector('input[name="image_url"]');
    if(!urlInput) return;

    const urlLabel = urlInput.closest('label');
    const uploadWrap = document.createElement('label');
    uploadWrap.className = 'full glovaera-category-upload';
    uploadWrap.innerHTML = `
      Upload from device / Gallery
      <input type="file" name="category_image_file" accept="image/*">
      <small>Photo URL না দিলে এখান থেকে phone/gallery-এর ছবি বেছে নিতে পারবে। ছবি select করলে সেটাই automatically upload হবে.</small>
      <span class="glovaera-category-upload-preview" hidden></span>
    `;
    urlLabel?.insertAdjacentElement('afterend', uploadWrap);

    const fileInput = uploadWrap.querySelector('input[type="file"]');
    const preview = uploadWrap.querySelector('.glovaera-category-upload-preview');
    fileInput?.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      if(!file){
        preview.hidden = true;
        preview.innerHTML = '';
        return;
      }
      const url = URL.createObjectURL(file);
      preview.hidden = false;
      preview.innerHTML = `<img src="${url}" alt="Selected category image"><span>${escapeHtml(file.name)}</span>`;
    });

    form.addEventListener('submit', async function(event){
      event.preventDefault();
      event.stopImmediatePropagation();

      const client = getClient();
      if(!client){
        alert('Supabase connection is not available.');
        return;
      }

      const fd = new FormData(form);
      const button = form.querySelector('button[type="submit"]');
      const oldText = button?.textContent || 'Save category';
      if(button){ button.disabled = true; button.textContent = 'Saving...'; }

      try{
        let imageUrl = String(fd.get('image_url') || '').trim() || 'logo.png';
        const file = fd.get('category_image_file');

        if(file && file.size){
          if(!file.type.startsWith('image/')) throw new Error('Please choose an image file.');
          const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
          const path = `categories/${crypto.randomUUID()}-${safeName}`;
          const uploaded = await client.storage.from('product-images').upload(path, file, {
            upsert:false,
            contentType:file.type
          });
          if(uploaded.error) throw uploaded.error;
          imageUrl = client.storage.from('product-images').getPublicUrl(path).data.publicUrl;
        }

        const record = {
          name: fd.get('name'),
          slug: fd.get('slug'),
          image_url: imageUrl
        };
        const id = fd.get('id');
        const query = id
          ? client.from('categories').update(record).eq('id', id)
          : client.from('categories').insert(record);
        const {error} = await query;
        if(error) throw error;

        document.getElementById('closeModal')?.click();
        location.reload();
      }catch(error){
        console.error('Category image upload error:', error);
        alert(error.message || 'Could not save category.');
        if(button){ button.disabled = false; button.textContent = oldText; }
      }
    }, true);
  }

  function scan(){
    enhanceCategoryForm(document.getElementById('categoryForm'));
  }

  const observer = new MutationObserver(scan);
  observer.observe(document.body, {childList:true, subtree:true});
  scan();
})();
