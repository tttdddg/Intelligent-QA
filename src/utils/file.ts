export function fmtSize(b:number):string{
    const units=['B','KB','MB','GB'];
    let i=0;
    while(b>=1024&&i<units.length-1){
        b/=1024;
        i++;
    }
    return `${b.toFixed(2)}${units[i]}`;
}

export function downloadFile(blob:Blob,filename:string){
    const a=document.createElement('a');
    const url=URL.createObjectURL(blob);
    a.href=url;
    a.download=filename;
    a.click();
    URL.revokeObjectURL(url);
}

