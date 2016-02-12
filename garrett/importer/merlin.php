<?php
/**
 * Queries Merlin for a photo by its ID and then saves it into 
 * the ../app/images folder.
 * 
 * This is heavily (almost entirely) borrowed from the excellently
 * hacky function that Will wrote in Wordpress.
 * 
 */
function bdn_input_merlin_photo( $merlin_id = false ) {

	if( empty( $merlin_id ) )
		return false;

	//So it goes a little something like this
	//First, retrieve the cookie
	$ch = curl_init( 'http://ban.merlinone.net/mweb/wmsql.wm.request?LOGIN' );
	$fields = array( 'f_username' => MERLIN_USERNAME, 'f_pin' => MERLIN_PASSWORD );
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false );
	curl_setopt($ch,CURLOPT_POST,true);
	curl_setopt($ch,CURLOPT_POSTFIELDS,'f_username=wordpress&f_pin=pr0gress');
	curl_setopt($ch, CURLOPT_HEADER, 1);
	preg_match('/^Set-Cookie: (.*?);/m', curl_exec($ch), $m);
	
	$ch = curl_init( 'http://ban.merlinone.net/mweb/wmsql.wm.request?FQUERY' );
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false );
	curl_setopt($ch,CURLOPT_COOKIE,$m[1]);
	curl_setopt($ch,CURLOPT_POST,true);
	curl_setopt($ch,CURLOPT_POSTFIELDS,'f_objP=1&f_sortorder=-INDATE_T&f_sortby=1&f_advsearch=Y&f_cimage1=' . $merlin_id);
	$body = curl_exec($ch);
	
	//Replace relative URLs with absolute URLs
	$body = str_replace( '<img src="/', '<img src="http://ban.merlinone.net/', $body );
	$body = str_replace( array( "\r\n", "\r", "\n" ), " ", $body );

	//Get the images and IDs
	preg_match_all( '#<td width="244" valign="top"><a href="/mweb/wmsql.wm.request\?HIT_(.*?)"><img src="(.*?)"(.*?)</td>#', $body, $images );
	preg_match_all( '|<a href=#  onClick="whatsize=(.*?); whatext=\'(.*?)\'; whatid=\'(.*?)\'; DownloadAttachment\(\'(.*?)\',\'(.*?)\);|', $body, $IDs );
	
	
	$ch = curl_init( 'http://ban.merlinone.net/mweb/wmsql.wm.request?MAIL_' . $images[1][0] );
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false );
	curl_setopt($ch,CURLOPT_COOKIE,$m[1]);
	$body = curl_exec($ch);
	
	//And retrieve the next URL in this rabbit hole
	preg_match_all( '#<meta HTTP-EQUIV="Refresh" content="3;URL=(.*?)">#', $body, $nexturl );
	//Compose the next link
	$link = 'http://ban.merlinone.net/mweb/' . str_replace( ' ', '%20', trim( $nexturl[1][0] ) );
	//Now we're playing a waiting game till the image is ready. Loop through and sleep till we get our image
	$found = false;
	for( $i = 1; $i <= 3; $i++ ) {
		if( !empty( $found ) )
			continue;
		
		sleep( $i );
		
		$ch = curl_init( $link );
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false );
		curl_setopt($ch,CURLOPT_COOKIE,$m[1]);
		$body = curl_exec($ch);
		
		preg_match_all( '#<meta HTTP-EQUIV="Refresh" content="0;URL=/jpegs/(.*?)">#', $body, $nexturl );
		
		$found = $nexturl[ 1 ][ 0 ];
		
	}
	
	curl_close( $ch );
	
	//No image found!
	if( empty( $found ) )
		die( "Derp. The image ID {$merlin_id} wasn't found." );
		
	usleep( 10000 );
	
	
	$file = 'http://ban.merlinone.net/jpegs/' . $found;
	$newfile = realpath(dirname(__FILE__)) . "/../app/images/" . $merlin_id . ".jpg";
	copy( $file, $newfile );
	
	return true;
}
