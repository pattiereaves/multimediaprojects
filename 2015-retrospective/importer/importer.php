<?php
header('Content-type: text/html; Charset=utf-8');
libxml_use_internal_errors(true); //hide the DomDocument errors.

include('merlin.php'); //Imports the image files, if merlin ids used.

// Load the chapter config file
$chapter_config_string = file_get_contents(realpath(dirname(__FILE__)) . '/../app/data/chapters.json') or die( 'Could not open config file' );
$chapter_config = json_decode($chapter_config_string) or die( 'Invalid JSON in the chapter file' );

// Process each chapter.
// Spit out tasty content
foreach( $chapter_config as $chapter ) {
	if( !empty($chapter->doc) && !empty($chapter->name) ) {
		$chapter->name = str_replace(" ", "-", $chapter->name);
		create_json_file( $chapter->doc, strtolower( $chapter->name ) );
	}
}


/**
 * Takes the doc and formats it in a JSON file.
 * The file is output into the data folder inside the app folder.
 */
function create_json_file( $doc_url, $file_name ) {

	//Get the file
	$string = file_get_contents( $doc_url ) or die( "Could not open {$doc_url} for reading" );

	//Deal with character encoding
	$string = mb_convert_encoding($string, 'utf-8', mb_detect_encoding($string));
	// if you have not escaped entities use
	$file = mb_convert_encoding($string, 'html-entities', 'utf-8'); 

	// Replaces the italics and the bolds in the string.
	preg_match_all( '/.c(?P<digit>\d+){[^}]*(?>font-style:bold)[^{]*}/im', $file, $matches['strong'] );
	preg_match_all('/.c(?P<digit>\d+){[^}]*(?>font-style:italic)[^{]*}/im', $file, $matches['em']);

	foreach( $matches as $type => $match ) {
		if(!empty( $match['digit'] )) {
			foreach( $match['digit'] as $class ) {
				$file = preg_replace( '#<span class="[^>]*c'.$class.'[^>]*">(?<text>[^<]+)<\/span>#', '<'.$type.'>$1</'.$type.'>', $file );
			}
		}
	}

	//Set up DOMDocument so we can parse the XML
	$doc = new DOMDocument('1.0', 'UTF-8');
	$doc->substituteEntities = TRUE;
	$doc->loadHTML( $file );
	$xpath = new DOMXPath( $doc );

	
	$elements = $xpath->query('//p | //ul | //ol');
	
	//Initialize variables
	$output = array(
		'chapters' => array(),
	);
	$heading = 0; //Counter. 

	foreach( $elements as $element ) {

		/**
		 * Check to see what type of element it is — paragraph or list.
		 * If it is a list item, then you'll need to get the list items and then put it all in a paragraph.
		 * If it is a paragraph, lets look to see if it has multimedia attached to it.
		 */

		$elementValue = trim($element->textContent);
			
		if( !empty($elementValue) ) {
			/*
				Get the attribute
				If it has "subtitle", wrap it in h2 tags.
				If it's wrapped in curly braces, convert to php array to describe art.
				If it doesn't, wrap it in a p tag.
				Put in JSON array.
			 
				 @todo it would be so great if you could have a link in a caption. ¯\_(ツ)_/¯
			*/
			if( stripos($element->getAttribute( 'class' ), 'subtitle') ) {
				$heading++;
				$output['chapters'][$heading] = array(
					'heading' => $element->nodeValue,
					'content' => array(  ),
					//@todo none of these are set
					'preview image' => '',
					'short title' => '',
				);
			} elseif( stripos($element->nodeValue, '{') !== FALSE) {
				//This is a rich media asset
				//A heading should be set when it triggered a earlier in this loop.

				$clean_string = str_replace("“", "\"", $element->nodeValue);
				$clean_string = str_replace("”", "\"", 	$clean_string);
				$clean_string = trim($clean_string);

				$rich_media = json_decode($clean_string);
				if( is_null($rich_media) ) 
					die( 'There is a parse error with your rich media: ' . var_dump( $clean_string ));

				if( is_null($rich_media->filetype) )
					die( 'Your rich media is missing attributes. ' . var_dump($clean_string) );

				// Check if the filename is an int. If so, pull the asset from Merlin.
				if( is_numeric($rich_media->filename) ) {
					import_photo($rich_media->filename);
				} elseif(is_numeric($rich_media->poster)) {
					import_photo($rich_media->poster);
				}

				//Provides some basic validation.
				$output['chapters'][$heading]['content'][] = array( 
					'filename' => isset($rich_media->filename) ? $rich_media->filename : '',
					'filetype' => $rich_media->filetype,
					'size' => preg_match('/^(big|medium|small)$/', $rich_media->size) ? $rich_media->size : 'big',
					'orientation' => preg_match('/^(left|right|full|background)$/', $rich_media->orientation) ? $rich_media->orientation : 'full',
					'caption' => $rich_media->caption, //May be null
					'credit' => $rich_media->credit,
					'poster' => isset($rich_media->poster) ? $rich_media->poster : '', //Added with PWM project
				);
			} else {
				// This is a paragraph or a list item.
				
				if ( preg_match('/\Sl/i', $element->tagName) ) {
					// This is a <ul> or <ol> node

					/**
					 * Saves all the child items of this node in an array.
					 * Then save all of these child items as a unit.
					 */
					$listItems = array();

					foreach( $element->childNodes as $item ) {

						$v = trim(strip_tags($doc->saveXml( $item ), '<a><em><strong>'));

						if( !empty($v) ) {
							$listItems[] = $v;
						}
					}

					$output['chapters'][$heading]['content'][] = array(
						'filename' => NULL,
						'filetype' => 'list',
						'size' => null,
						'orientation' => null,
						'caption' => '<'.$element->tagName.'><li>'. implode('</li><li>', $listItems) . '</li></'.$element->tagName.'>', 
					);

					unset( $listItems );

				} else {
					// This is a paragraph.
				
					$value = trim(strip_tags($doc->saveXml( $element ), '<a><em><strong>'));

					if( !empty( $value ) ) {
						$output['chapters'][$heading]['content'][] = array( 
							'filename' => NULL,
							'filetype' => 'text',
							'size' => null,
							'orientation' => null,
							'caption' => $value, 
						);
					}
				}
			}			
		} // if the string isn't empty

	}

	//Now write this to a file.
	file_put_contents(realpath(dirname(__FILE__)).'/../app/data/'.$file_name.'.json', json_encode($output)) or die ( 'Could not open file for writing.' );
	echo date( "Y-m-d H:i:s" ) . " successful import. \r\n";
}

function import_photo(&$filename) {
	if(!file_exists(realpath(dirname(__FILE__)).'/../app/images/'.$filename.'.jpg')) {
		bdn_input_merlin_photo($filename); //see merlin.php
		$filename = $filename . ".jpg";
		echo "Merlin ID {$filename} requested. \n";
	} else {
		echo "Photo ID {$filename} already imported.\n";
		$filename = $filename . ".jpg";
	}
}