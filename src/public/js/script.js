document.getElementById('form-symmetric-encrypt').addEventListener('submit', async (e) => {
    e.preventDefault()
    const plaintext = document.getElementById('plaintext').value
    const key = document.getElementById('key').value
    const iv = document.getElementById('iv').value

    if(key.length < 32) {
        document.getElementById('symm-key-error').style.visibility = 'visible'
        e.preventDefault()
    }else{
        document.getElementById('symm-key-error').textContent = ''
    }

    if(iv.length < 16) {
        document.getElementById('symm-iv-error').style.visibility = 'visible'
        e.preventDefault()
    }else{
        document.getElementById('symm-iv-error').textContent = ''
    }    

    const response = await fetch('/symmetric/encrypt', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ plaintext, key, iv })
    })
    const responseData = await response.json()
    
    if (response.ok) {

        const { data } = responseData
        const { encryptedMessage } = data
        document.getElementById('encrypted-textarea').value = encryptedMessage
    }
})


document.getElementById('form-symmetric-decrypt').addEventListener('submit', async(e) => {
    e.preventDefault()

    const encryptedText = document.getElementById('decrypted-text').value
    const key = document.getElementById('decrypted-key').value
    const iv = document.getElementById('decrypted-iv').value

    if(key.length < 32) {
        document.getElementById('dec-key-error').style.visibility = 'visible'
        e.preventDefault()
    }else{
        document.getElementById('dec-key-error').textContent = ''
    }

    if(iv.length < 16) {
        document.getElementById('dec-iv-error').style.visibility = 'visible'
        e.preventDefault()
    }else{
        document.getElementById('dec-iv-error').textContent = ''
    }    

    const response = await fetch('/symmetric/decrypt', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ encryptedText, key, iv })
    })

    const responseData = await response.json()
    if(response.ok) {
        const { data } = responseData
        document.getElementById('decrypted-textarea').value = data
    }
})

document.getElementById('symmetric-toggle').addEventListener('click', () => {
    document.getElementById('asym-encrypt-form').style.visibility = 'hidden';
    document.getElementById('asym-encrypt-form').style.display = 'none';

    document.getElementById('sym-form').style.visibility = 'visible';
    document.getElementById('sym-form').style.display = 'grid';

    document.getElementById('asymmetric-toggle').classList.remove('active');
    document.getElementById('symmetric-toggle').classList.add('active');
});

document.getElementById('asymmetric-toggle').addEventListener('click', () => {
    document.getElementById('sym-form').style.visibility = 'hidden';
    document.getElementById('sym-form').style.display = 'none';

    document.getElementById('asym-encrypt-form').style.visibility = 'visible';
    document.getElementById('asym-encrypt-form').style.display = 'block';

    document.getElementById('symmetric-toggle').classList.remove('active');
    document.getElementById('asymmetric-toggle').classList.add('active');
});


document.getElementById('generate').addEventListener('click', async () => {
    const keys = await generateKeyPair();
    document.getElementById('public-key-textarea').value = keys.publicKey;
    document.getElementById('private-key-textarea').value = keys.privateKey;
});

async function generateKeyPair() {
    const keys = await window.crypto.subtle.generateKey(
        {
            name: 'RSA-OAEP',
            modulusLength: 2048,
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
            hash: 'SHA-256'
        },
        true,
        ['encrypt', 'decrypt']
    );

    const publicKey = await window.crypto.subtle.exportKey('spki', keys.publicKey);
    const privateKey = await window.crypto.subtle.exportKey('pkcs8', keys.privateKey);

    return {
        publicKey: convertBinaryToPEM(publicKey, 'PUBLIC KEY'),
        privateKey: convertBinaryToPEM(privateKey, 'PRIVATE KEY')
    };
}

function convertBinaryToPEM(binaryData, label) {
    const binaryString = String.fromCharCode.apply(null, new Uint8Array(binaryData));
    const base64String = btoa(binaryString);
    let pemString = '';

            for (let i = 0; i < base64String.length; i += 64) {
                pemString += `${base64String.slice(i, i + 64)}\n`;
            }
            return pemString;
}

document.getElementById('asym-encrypt').addEventListener('submit', async (e) => {
    e.preventDefault()
    const plaintext = document.getElementById('asym-encrypt-text').value
    let publickey = document.getElementById('asym-encrypt-key').value
    publickey = publickey.replace(/\s/g, '')

    const response = await fetch('/asymmetric/encrypt', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ plaintext, publickey }) 
    })

    const result = await response.json()
    if(response.ok){
        const { data } = result 
        document.getElementById('asym-encrypted-textarea').value = data
    }
    
})

document.getElementById('asym-decrypt').addEventListener('submit', async (e) => {
    e.preventDefault();
    let encryptedtext = document.getElementById('asym-decrypt-text').value
    let privatekey = document.getElementById('asym-decrypt-key').value
    encryptedtext = encryptedtext.replace(/\s/g, '')
    privatekey = privatekey.replace(/\s/g, '')

    const response = await fetch('/asymmetric/decrypt', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ encryptedtext, privatekey }) 
    })

    const result = await response.json()
    if(response.ok){
        const { data } = result 
        document.getElementById('asym-decrypted-textarea').value = data
    }
});
