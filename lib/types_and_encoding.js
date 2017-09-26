

/**
 * This function assign to object a type of encod/decod
 * to use depending of content-type
 */
exports.assignTypeOfData = function(object,headers){
	//Type forced by user
	if (object.type !== undefined){
        return false;
    }

    if (headers['content-type'] !== undefined){
    	var hct = headers['content-type'].split(';');
    	htc = hct[0].trim();
    	switch(htc){
    		case 'text/xml':
    			object.type = 'xml';
    			break;
    		case 'application/json':
    			object.type = 'json';
    			break;
    		case 'application/x-www-form-urlencoded':
    			object.type = 'form';
    			break;  
    		default:
    			object.type = 'direct';
    			break;      			
    	}
    } else {
    	object.type = 'direct';
    }
    return true;
};


/**
 * COMPLETE LIST OF MIMES:
 * 
.aac	AAC audio file	audio/aac
.abw	AbiWord document	application/x-abiword
.arc	Archive document (multiple files embedded)	application/octet-stream
.avi	AVI: Audio Video Interleave	video/x-msvideo
.azw	Amazon Kindle eBook format	application/vnd.amazon.ebook
.bin	Any kind of binary data	application/octet-stream
.bz	    BZip archive	application/x-bzip
.bz2	BZip2 archive	application/x-bzip2
.csh	C-Shell script	application/x-csh
.css	Cascading Style Sheets (CSS)	text/css
.csv	Comma-separated values (CSV)	text/csv
.doc	Microsoft Word	application/msword
.epub	Electronic publication (EPUB)	application/epub+zip
.gif	Graphics Interchange Format (GIF)	image/gif
.htm
.html	HyperText Markup Language (HTML)	text/html
.ico	Icon format	image/x-icon
.ics	iCalendar format	text/calendar
.jar	Java Archive (JAR)	application/java-archive
.jpeg
.jpg	JPEG images	image/jpeg
.js	    JavaScript (ECMAScript)	application/javascript
.json	JSON format	application/json
.mid
.midi	Musical Instrument Digital Interface (MIDI)	audio/midi
.mpeg	MPEG Video	video/mpeg
.mpkg	Apple Installer Package	application/vnd.apple.installer+xml
.odp	OpenDocuemnt presentation document	application/vnd.oasis.opendocument.presentation
.ods	OpenDocuemnt spreadsheet document	application/vnd.oasis.opendocument.spreadsheet
.odt	OpenDocument text document	application/vnd.oasis.opendocument.text
.oga	OGG audio	audio/ogg
.ogv	OGG video	video/ogg
.ogx	OGG	application/ogg
.pdf	Adobe Portable Document Format (PDF)	application/pdf
.ppt	Microsoft PowerPoint	application/vnd.ms-powerpoint
.rar	RAR archive	application/x-rar-compressed
.rtf	Rich Text Format (RTF)	application/rtf
.sh	    Bourne shell script	application/x-sh
.svg	Scalable Vector Graphics (SVG)	image/svg+xml
.swf	Small web format (SWF) or Adobe Flash document	application/x-shockwave-flash
.tar	Tape Archive (TAR)	application/x-tar
.tif
.tiff	Tagged Image File Format (TIFF)	image/tiff
.ttf	TrueType Font	font/ttf
.vsd	Microsft Visio	application/vnd.visio
.wav	Waveform Audio Format	audio/x-wav
.weba	WEBM audio	audio/webm
.webm	WEBM video	video/webm
.webp	WEBP image	image/webp
.woff	Web Open Font Format (WOFF)	font/woff
.woff2	Web Open Font Format (WOFF)	font/woff2
.xhtml	XHTML	application/xhtml+xml
.xls	Microsoft Excel	application/vnd.ms-excel
.xml	XML	application/xml
.xul	XUL	application/vnd.mozilla.xul+xml
.zip	ZIP archive	application/zip
.3gp	3GPP audio/video container	video/3gpp
audio/3gpp if it doesn't contain video
.3g2	3GPP2 audio/video container	video/3gpp2
audio/3gpp2 if it doesn't contain video
.7z	7-zip archive	application/x-7z-compressed
 */
