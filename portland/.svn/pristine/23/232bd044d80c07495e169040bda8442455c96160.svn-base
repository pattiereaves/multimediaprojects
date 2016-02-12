<?php
header('Content-type: text/html; Charset=utf-8'); 

// Load the chapter config file
$chapter_config_string = file_get_contents('http://localhost/portland/app/data/chapters.json') or die( 'Could not open config file' );
$chapter_config = json_decode($chapter_config_string) or die( 'Invalid JSON in the chapter file' );

// Process each chapter.
// Spit out tasty content
foreach( $chapter_config as $chapter ) {
	if( !empty($chapter->doc) && !empty($chapter->name) ) {
		create_json_file( $chapter->doc, strtolower( $chapter->name ) );
	}
}

/*
	Takes the doc and formats it based on the rules we've used.
*/
function create_json_file( $doc_url, $file_name ) {

	//Get the file
	$string = file_get_contents( $doc_url ) or die( "Could not open {$doc_url} for reading" );

	//Deal with character encoding
	$string = mb_convert_encoding($string, 'utf-8', mb_detect_encoding($string));
	// if you have not escaped entities use
	$file = mb_convert_encoding($string, 'html-entities', 'utf-8'); 

	//Set up DOMDocument
	$doc = new DOMDocument('1.0', 'UTF-8');
	$doc->substituteEntities = TRUE;
	$doc->loadHTML( $file );

	$paragraphs = $doc->getElementsByTagName( 'p' );

	//Initialize variables
	$output = array(
		'chapters' => array(),
	);
	$heading = 0; //Counter. 

	foreach( $paragraphs as $paragraph ) {
		$elementValue = $doc->saveXml( $paragraph );

		if( !empty($elementValue) ) {
			/*
				Get the attribute
				If it has "subtitle", wrap it in h2 tags.
				If it's wrapped in curly braces, convert to php array to describe art.
				If it doesn't, wrap it in a p tag.
				Put in JSON array.
			*/

			if( stripos($paragraph->getAttribute( 'class' ), 'subtitle') ) {
				$heading++;
				$output['chapters'][$heading] = array(
					'heading' => $paragraph->nodeValue,
					'content' => array(  ),
					//@todo none of these are set
					'preview image' => '',
					'short title' => '',
				);
			} elseif( stripos($paragraph->nodeValue, '{') !== FALSE) {
				//This is a rich media asset
				//A heading should be set when it triggered a earlier in this loop.

				$clean_string = str_replace("“", "\"", $paragraph->nodeValue);
				$clean_string = str_replace("”", "\"", 	$clean_string);

				$rich_media = json_decode($clean_string);
				if( is_null($rich_media) ) 
					die( 'There is a parse error with your rich media: ' . var_dump( $clean_string ));

				if( is_null($rich_media->filename) || is_null($rich_media->filetype) )
					die( 'Your rich media is missing attributes. ' . var_dump($clean_string) );

				//Provides some basic validation.
				$output['chapters'][$heading]['content'][] = array( 
					'filename' => $rich_media->filename,
					'filetype' => $rich_media->filetype,
					'size' => preg_match('/^(big|medium|small)$/', $rich_media->size) ? $rich_media->size : 'big',
					'orientation' => preg_match('/^(left|right|full|background)$/', $rich_media->orientation) ? $rich_media->orientation : 'full',
					'caption' => $rich_media->caption, //May be null
					'credit' => $rich_media->credit,
					'poster' => isset($rich_media->poster) ? $rich_media->poster : '', //Added with PWM project
				);
			} else {
				$value = trim(strip_tags($doc->saveXml( $paragraph ), '<a>'));

				if( !empty( $value ) ) {
					$output['chapters'][$heading]['content'][] = array( 
						'filename' => NULL,
						'filetype' => 'text',
						'size' => null,
						'orientation' => null,
						'caption' => $value, 
						// 'caption' => $doc->saveXml( $paragraph ), 
					);
				}
				// $output['chapters'][$heading]['content'][] = strip_tags($paragraph->nodeValue, 'a');
			}			
		} // if the string isn't empty
	}

	//Now write this to a file.
	file_put_contents('/Library/WebServer/Documents/portland/app/data/'.$file_name.'.json', json_encode($output)) or die ( 'Could not open file for writing.' );
	echo date( "Y-m-d H:i:s" ) . " successful import. \r\n";
}

/*
	Saves my sanity and makes shit easy to debug.
*/
function dpr( $value ) {
	echo "<pre>";
	var_dump($value);
	echo "</pre>";
}