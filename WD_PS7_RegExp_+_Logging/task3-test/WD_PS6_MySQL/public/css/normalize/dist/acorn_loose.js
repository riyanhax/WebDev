  'pecl' => true,
  ),
  'zip_entry_filesize' =>
  array (
    'init' => '1.0',
    'end' => '1.9.0',
    'ext' => 'zip',
    'pecl' => true,
  ),
  'zip_entry_name' =>
  array (
    'init' => '1.0',
    'end' => '1.9.0',
    'ext' => 'zip',
    'pecl' => true,
  ),
  'zip_entry_open' =>
  array (
    'init' => '1.0',
    'end' => '1.9.0',
    'ext' => 'zip',
    'pecl' => true,
  ),
  'zip_entry_read' =>
  array (
    'init' => '1.0',
    'end' => '1.9.0',
    'ext' => 'zip',
    'pecl' => true,
  ),
  'zip_open' =>
  array (
    'init' => '1.0',
    'end' => '1.9.0',
    'ext' => 'zip',
    'pecl' => true,
  ),
  'zip_read' =>
  array (
    'init' => '1.0',
    'end' => '1.9.0',
    'ext' => 'zip',
    'pecl' => true,
  ),
);
?>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               <?php
/* 
V5.18 3 Sep 2012  (c) 2000-2012 John Lim (jlim#natsoft.com). All rights reserved.
  Released under both BSD license and Lesser GPL library license. 
  Whenever there is any discrepancy between the two licenses, 
  the BSD license will take precedence. 
Set tabs to 4 for best viewing.
  
  Latest version is available at http://adodb.sourceforge.net
  
  Microsoft SQL Server ADO data driver. Requires ADO and MSSQL client. 
  Works only on MS Windows.
  
  Warning: Some versions of PHP (esp PHP4) leak memory when ADO/COM is used. 
  Please check http://bugs.php.net/ for more info.
*/

// security - hide paths
if (!defined('ADODB_DIR')) die();

if (!defined('_ADODB_ADO_LAYER')) {
	if (PHP_VERSION >= 5) include(ADODB_DIR."/drivers/adodb-ado5.inc.php");
	else include(ADODB_DIR."/drivers/adodb-ado.inc.php");
}


class  ADODB_ado_mssql extends ADODB_ado {        
	var $databaseType = 'ado_mssql';
	var $hasTop = 'top';
	var $hasInsertID = true;
	var $sysDate = 'convert(datetime,convert(char,GetDate(),102),102)';
	var $sysTimeStamp = 'GetDate()';
	var $leftOuter = '*=';
	var $rightOuter = '=*';
	var $ansiOuter = true; // for mssql7 or later
	var $substr = "substring";
	var $length = 'len';
	var $_dropSeqSQL = "drop table %s";
	
	//var $_inTransaction = 1; // always open recordsets, so no transaction problems.
	
	function ADODB_ado_mssql()
	{
	        $this->ADODB_ado();
	}
	
	function _insertid()
	{
	        return $this->GetOne('select SCOPE_IDENTITY()');
	}
	
	function _affectedrows()
	{
	        return $this->GetOne('select @@rowcount');
	}
	
	function SetTransactionMode( $transaction_mode ) 
	{
		$this->_transmode  = $transaction_mode;
		if (empty($transaction_mode)) {
			$this->Execute('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');
			return;
		}
		if (!stristr($transaction_mode,'isolation')) $transaction_mode = 'ISOLATION LEVEL '.$transaction_mode;
		$this->Execute("SET TRANSACTION ".$transaction_mode);
	}
	
	function qstr($s,$magic_quotes=false)
	{
		$s = ADOConnection::qstr($s, $magic_quotes);
		return str_replace("\0", "\\\\000", $s);
	}
	
	function MetaColumns($table, $normalize=true)
	{
        $table = strtoupper($table);
        $arr= array();
        $dbc = $this->_connectionID;
        
        $osoptions = array();
        $osoptions[0] = null;
        $osoptions[1] = null;
        $osoptions[2] = $table;
        $osoptions[3] = null;
        
        $adors=@$dbc->OpenSchema(4, $osoptions);//tables

        if ($adors){
                while (!$adors->EOF){
                        $fld = new ADOFieldObject();
                        $c = $adors->Fields(3);
                        $fld->name = $c->Value;
                        $fld->type = 'CHAR'; // cannot discover type in ADO!
                        $fld->max_length = -1;
                        $arr[strtoupper($fld->name)]=$fld;
        
                        $adors->MoveNext();
                }
                $adors->Close();
        }
        $false = false;
		return empty($arr) ? $false : $arr;
	}
	
	function CreateSequence($seq='adodbseq',$start=1)
	{
		
		$this->Execute('BEGIN TRANSACTION adodbseq');
		$start -= 1;
		$this->Execute("create table $seq (id float(53))");
		$ok = $this->Execute("insert into $seq with (tablock,holdlock) values($start)");
		if (!$ok) {
				$this->Execute('ROLLBACK TRANSACTION adodbseq');
				return false;
		}
		$this->Execute('COMMIT TRANSACTION adodbseq'); 
		return true;
	}

	function GenID($seq='adodbseq',$start=1)
	{
		//$this->debug=1;
		$this->Execute('BEGIN TRANSACTION adodbseq');
		$ok = $this->Execute("update $seq with (tablock,holdlock) set id = id + 1");
		if (!$ok) {
			$this->Execute("create table $seq (id float(53))");
			$ok = $this->Execute("insert into $seq with (tablock,holdlock) values($start)");
			if (!$ok) {
				$this->Execute('ROLLBACK TRANSACTION adodbseq');
				return false;
			}
			$this->Execute('COMMIT TRANSACTION adodbseq'); 
			return $start;
		}
		$num = $this->GetOne("select id from $seq");
		$this->Execute('COMMIT TRANSACTION adodbseq'); 
		return $num;
		
		// in old implementation, pre 1.90, we returned GUID...
		//return $this->GetOne("SELECT CONVERT(varchar(255), NEWID()) AS 'Char'");
	}
	
	} // end class 
	
	class  ADORecordSet_ado_mssql extends ADORecordSet_ado {        
	
	var $databaseType = 'ado_mssql';
	
	function ADORecordSet_ado_mssql($id,$mode=false)
	{
	        return $this->ADORecordSet_ado($id,$mode);
	}
}
?>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              <?php
/**
 * Generic_Sniffs_VersionControl_SubversionPropertiesSniff.
 *
 * PHP version 5
 *
 * @category  PHP
 * @package   PHP_CodeSniffer
 * @author    Jack Bates <ms419@freezone.co.uk>
 * @copyright 2006-2011 Squiz Pty Ltd (ABN 77 084 670 600)
 * @license   http://matrix.squiz.net/developer/tools/php_cs/licence BSD Licence
 * @link      http://pear.php.net/package/PHP_CodeSniffer
 */

/**
 * Generic_Sniffs_VersionControl_SubversionPropertiesSniff.
 *
 * Tests that the correct Subversion properties are set.
 *
 * @category  PHP
 * @package   PHP_CodeSniffer
 * @author    Jack Bates <ms419@freezone.co.uk>
 * @copyright 2006-2011 Squiz Pty Ltd (ABN 77 084 670 600)
 * @license   http://matrix.squiz.net/developer/tools/php_cs/licence BSD Licence
 * @version   Release: 1.3.3
 * @link      http://pear.php.net/package/PHP_CodeSniffer
 */
class Generic_Sniffs_VersionControl_SubversionPropertiesSniff implements PHP_CodeSniffer_Sniff
{

    /**
     * The Subversion properties that should be set.
     *
     * Key of array is the SVN property and the value is the
     * exact value the property should have or NULL if the
     * property should just be set but the value is not fixed.
     *
     * @var array
     */
    protected $properties = array(
                             'svn:keywords'  => 'Author Id Revision',
                             'svn:eol-style' => 'native',
                            );


    /**
     * Returns an array of tokens this test wants to listen for.
     *
     * @return array
     */
    public function register()
    {
        return array(T_OPEN_TAG);

    }//end register()


    /**
     * Processes this test, when one of its tokens is encountered.
     *
     * @param PHP_CodeSniffer_File $phpcsFile The file being scanned.
     * @param int                  $stackPtr  The position of the current token
     *                                        in the stack passed in $tokens.
     *
     * @return void
     */
    public function process(PHP_CodeSniffer_File $phpcsFile, $stackPtr)
    {
        $tokens = $phpcsFile->getTokens();

        // Make sure this is the first PHP open tag so we don't process the
        // same file twice.
        $prevOpenTag = $phpcsFile->findPrevious(T_OPEN_TAG, ($stackPtr - 1));
        if ($prevOpenTag !== false) {
            return;
        }

        $path       = $phpcsFile->getFileName();
        $properties = $this->getProperties($path);
        if ($properties === null) {
            // Not under version control.
            return;
        }

        $properties += $this->properties;
        foreach ($properties as $key => $value) {
            if (isset($properties[$key]) === true
                && isset($this->properties[$key]) === false
            ) {
                $error = 'Unexpected Subversion property "%s" = "%s"';
                $data  = array(
                          $key,
                          $properties[$key],
                         );
                $phpcsFile->addError($error, $stackPtr, 'Unexpected', $data);
                continue;
            }

            if (isset($properties[$key]) === false
                && isset($this->properties[$key]) === true
            ) {
                $error = 'Missing Subversion property "%s" = "%s"';
                $data  = array(
                          $key,
                          $this->properties[$key],
                         );
                $phpcsFile->addError($error, $stackPtr, 'Missing', $data);
                continue;
            }

            if ($properties[$key] !== null
                && $properties[$key] !== $this->properties[$key]
            ) {
                $error = 'Subversion property "%s" = "%s" does not match "%s"';
                $data  = array(
                          $key,
                          $properties[$key],
                          $this->properties[$key],
                         );
                $phpcsFile->addError($error, $stackPtr, 'NoMatch', $data);
            }
        }//end foreach

    }//end process()


    /**
     * Returns the Subversion properties which are actually set on a path.
     *
     * Returns NULL if the file is not under version control.
     *
     * @param string $path The path to return Subversion properties on.
     *
     * @return array
     * @throws PHP_CodeSniffer_Exception If Subversion properties file could
     *                                   not be opened.
     */
    protected function getProperties($path)
    {
        $properties = array();

        $paths   = array();
        $paths[] = dirname($path).'/.svn/props/'.basename($path).'.svn-work';
        $paths[] = dirname($path).'/.svn/prop-base/'.basename($path).'.svn-base';

        $foundPath = false;
        foreach ($paths as $path) {
            if (file_exists($path) === true) {
                $foundPath = true;

                $handle = fopen($path, 'r');
                if ($handle === false) {
                    $error = 'Error opening file; could not get Subversion properties';
                    throw new PHP_CodeSniffer_Exception($error);
                }

                while (feof($handle) === false) {
                    // Read a key length line. Might be END, though.
                    $buffer = trim(fgets($handle));

                    // Check for the end of the hash.
                    if ($buffer === 'END') {
                        break;
                    }

                    // Now read that much into a buffer.
                    $key = fread($handle, substr($buffer, 2));

                    // Suck up extra newline after key data.
                    fgetc($handle);

                    // Read a value length line.
                    $buffer = trim(fgets($handle));

                    // Now read that much into a buffer.
                    $length = substr($buffer, 2);
                    if ($length === '0') {
                        // Length of value is ZERO characters, so
                        // value is actually empty.
                        $value = '';
                    } else {
                        $value = fread($handle, $length);
                    }

                    // Suck up extra newline after value data.
                    fgetc($handle);

                    $properties[$key] = $value;
                }//end while

                fclose($handle);
            }//end if
        }//end foreach

        if ($foundPath === false) {
            return null;
        }

        return $properties;

    }//end getProperties()


}//end class

?>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 <?php
/**
 * Squiz_Sniffs_NamingConventions_ValidVariableNameSniff.
 *
 * PHP version 5
 *
 * @category  PHP
 * @package   PHP_CodeSniffer
 * @author    Greg Sherwood <gsherwood@squiz.net>
 * @author    Marc McIntyre <mmcintyre@squiz.net>
 * @copyright 2006-2011 Squiz Pty Ltd (ABN 77 084 670 600)
 * @license   http://matrix.squiz.net/developer/tools/php_cs/licence BSD Licence
 * @link      http://pear.php.net/package/PHP_CodeSniffer
 */

if (class_exists('PHP_CodeSniffer_Standards_AbstractVariableSniff', true) === false) {
    throw new PHP_CodeSniffer_Exception('Class PHP_CodeSniffer_Standards_AbstractVariableSniff not found');
}

/**
 * Squiz_Sniffs_NamingConventions_ValidVariableNameSniff.
 *
 * Checks the naming of variables and member variables.
 *
 * @category  PHP
 * @package   PHP_CodeSniffer
 * @author    Greg Sherwood <gsherwood@squiz.net>
 * @author    Marc McIntyre <mmcintyre@squiz.net>
 * @copyright 2006-2011 Squiz Pty Ltd (ABN 77 084 670 600)
 * @license   http://matrix.squiz.net/developer/tools/php_cs/licence BSD Licence
 * @version   Release: 1.3.3
 * @link      http://pear.php.net/package/PHP_CodeSniffer
 */
class Squiz_Sniffs_NamingConventions_ValidVariableNameSniff extends PHP_CodeSniffer_Standards_AbstractVariableSniff
{

    /**
     * Tokens to ignore so that we can find a DOUBLE_COLON.
     *
     * @var array
     */
    private $_ignore = array(
                        T_WHITESPACE,
                        T_COMMENT,
                       );


    /**
     * Processes this test, when one of its tokens is encountered.
     *
     * @param PHP_CodeSniffer_File $phpcsFile The file being scanned.
     * @param int                  $stackPtr  The position of the current token in the
     *                                        stack passed in $tokens.
     *
     * @return void
     */
    protected function processVariable(PHP_CodeSniffer_File $phpcsFile, $stackPtr)
    {
        $tokens  = $phpcsFile->getTokens();
        $varName = ltrim($tokens[$stackPtr]['content'], '$');

        $phpReservedVars = array(
                            '_SERVER',
                            '_GET',
                            '_POST',
                            '_REQUEST',
                            '_SESSION',
                            '_ENV',
                            '_COOKIE',
                            '_FILES',
                            'GLOBALS',
                           );

        // If it's a php reserved var, then its ok.
        if (in_array($varName, $phpReservedVars) === true) {
            return;
        }

        $objOperator = $phpcsFile->findNext(array(T_WHITESPACE), ($stackPtr + 1), null, true);
        if ($tokens[$objOperator]['code'] === T_OBJECT_OPERATOR) {
            // Check to see if we are using a variable from an object.
            $var = $phpcsFile->findNext(array(T_WHITESPACE), ($objOperator + 1), null, true);
            if ($tokens[$var]['code'] === T_STRING) {
                $bracket = $objOperator = $phpcsFile->findNext(array(T_WHITESPACE), ($var + 1), null, true);
                if ($tokens[$bracket]['code'] !== T_OPEN_PARENTHESIS) {
                    $objVarName = $tokens[$var]['content'];

                    // There is no way for us to know if the var is public or private,
                    // so we have to ignore a leading underscore if there is one and just
                    // check the main part of the variable name.
                    $originalVarName = $objVarName;
                    if (substr($objVarName, 0, 1) === '_') {
                        $objVarName = substr($objVarName, 1);
                    }

                    if (PHP_CodeSniffer::isCamelCaps($objVarName, false, true, false) === false) {
                        $error = 'Variable "%s" is not in valid camel caps format';
                        $data  = array($originalVarName);
                        $phpcsFile->addError($error, $var, 'NotCamelCaps', $data);
                    }
                }//end if
            }//end if
        }//end if

        // There is no way for us to know if the var is public or private,
        // so we have to ignore a leading underscore if there is one and just
        // check the main part of the variable name.
        $originalVarName = $varName;
        if (substr($varName, 0, 1) === '_') {
            $objOperator = $phpcsFile->findPrevious(array(T_WHITESPACE), ($stackPtr - 1), null, true);
            if ($tokens[$objOperator]['code'] === T_DOUBLE_COLON) {
                // The variable lives within a class, and is referenced like
                // this: MyClass::$_variable, so we don't know its scope.
                $inClass = true;
            } else {
                $inClass = $phpcsFile->hasCondition($stackPtr, array(T_CLASS, T_INTERFACE));
            }

            if ($inClass === true) {
                $varName = substr($varName, 1);
            }
        }

        if (PHP_CodeSniffer::isCamelCaps($varName, false, true, false) === false) {
            $error = 'Variable "%s" is not in valid camel caps format';
            $data  = array($originalVarName);
            $phpcsFile->addError($error, $stackPtr, 'NotCamelCaps', $data);
        }

    }//end processVariable()


    /**
     * Processes class member variables.
     *
     * @param PHP_CodeSniffer_File $phpcsFile The file being scanned.
     * @param int                  $stackPtr  The position of the current token in the
     *                                        stack passed in $tokens.
     *
     * @return void
     */
    protected function processMemberVar(PHP_CodeSniffer_File $phpcsFile, $stackPtr)
    {
        $tokens = $phpcsFile->getTokens();

        $varName     = ltrim($tokens[$stackPtr]['content'], '$');
        $memberProps = $phpcsFile->getMemberProperties($stackPtr);
        if (empty($memberProps) === true) {
            // Couldn't get any info about this variable, which
            // generally means it is invalid or possibly has a parse
            // error. Any errors will be reported by the core, so
            // we can ignore it.
            return;
        }

        $public    = ($memberProps['scope'] !== 'private');
        $errorData = array($varName);

        if ($public === true) {
            if (substr($varName, 0, 1) === '_') {
                $error = '%s member variable "%s" must not contain a leading underscore';
                $data  = array(
                          ucfirst($memberProps['scope']),
                          $errorData[0],
                         );
                $phpcsFile->addError($error, $stackPtr, 'PublicHasUnderscore', $data);
                return;
            }
        } else {
            if (substr($varName, 0, 1) !== '_') {
                $error = 'Private member variable "%s" must contain a leading underscore';
                $phpcsFile->addError($error, $stackPtr, 'PrivateNoUnderscore', $errorData);
                return;
            }
        }

        if (PHP_CodeSniffer::isCamelCaps($varName, false, $public, false) === false) {
            $error = 'Variable "%s" is not in valid camel caps format';
            $phpcsFile->addError($error, $stackPtr, 'MemberNotCamelCaps', $errorData);
        }

    }//end processMemberVar()


    /**
     * Processes the variable found within a double quoted string.
     *
     * @param PHP_CodeSniffer_File $phpcsFile The file being scanned.
     * @param int                  $stackPtr  The position of the double quoted
     *                                        string.
     *
     * @return void
     */
    protected function processVariableInString(PHP_CodeSniffer_File $phpcsFile, $stackPtr)
    {
        $tokens = $phpcsFile->getTokens();

        $phpReservedVars = array(
                            '_SERVER',
                            '_GET',
                            '_POST',
                            '_REQUEST',
                            '_SESSION',
                            '_ENV',
                            '_COOKIE',
                            '_FILES',
                            'GLOBALS',
                           );
        if (preg_match_all('|[^\\\]\${?([a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*)|', $tokens[$stackPtr]['content'], $matches) !== 0) {
            foreach ($matches[1] as $varName) {
                // If it's a php reserved var, then its ok.
                if (in_array($varName, $phpReservedVars) === true) {
                    continue;
                }

                // There is no way for us to know if the var is public or private,
                // so we have to ignore a leading underscore if there is one and just
                // check the main part of the variable name.
                $originalVarName = $varName;
                if (substr($varName, 0, 1) === '_') {
                    if ($phpcsFile->hasCondition($stackPtr, array(T_CLASS, T_INTERFACE)) === true) {
                        $varName = substr($varName, 1);
                    }
                }

                if (PHP_CodeSniffer::isCamelCaps($varName, false, true, false) === false) {
                    $varName = $matches[0];
                    $error = 'Variable "%s" is not in valid camel caps format';
                    $data  = array($originalVarName);
                    $phpcsFile->addError($error, $stackPtr, 'StringNotCamelCaps', $data);
                    
                }
            }
        }//end if

    }//end processVariableInString()


}//end class

?>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   <?php
/**
 * Generic_Sniffs_Methods_OpeningMethodBraceBsdAllmanSniff.
 *
 * PHP version 5
 *
 * @category  PHP
 * @package   PHP_CodeSniffer
 * @author    Greg Sherwood <gsherwood@squiz.net>
 * @author    Marc McIntyre <mmcintyre@squiz.net>
 * @copyright 2006-2011 Squiz Pty Ltd (ABN 77 084 670 600)
 * @license   http://matrix.squiz.net/developer/tools/php_cs/licence BSD Licence
 * @link      http://pear.php.net/package/PHP_CodeSniffer
 */

/**
 * Generic_Sniffs_Functions_OpeningFunctionBraceBsdAllmanSniff.
 *
 * Checks that the opening brace of a function is on the line after the
 * function declaration.
 *
 * @category  PHP
 * @package   PHP_CodeSniffer
 * @author    Greg Sherwood <gsherwood@squiz.net>
 * @author    Marc McIntyre <mmcintyre@squiz.net>
 * @copyright 2006-2011 Squiz Pty Ltd (ABN 77 084 670 600)
 * @license   http://matrix.squiz.net/developer/tools/php_cs/licence BSD Licence
 * @version   Release: 1.3.3
 * @link      http://pear.php.net/package/PHP_CodeSniffer
 */
class Generic_Sniffs_Functions_OpeningFunctionBraceBsdAllmanSniff implements PHP_CodeSniffer_Sniff
{


    /**
     * Registers the tokens that this sniff wants to listen for.
     *
     * @return void
     */
    public function register()
    {
        return array(T_FUNCTION);

    }//end register()


    /**
     * Processes this test, when one of its tokens is encountered.
     *
     * @param PHP_CodeSniffer_File $phpcsFile The file being scanned.
     * @param int                  $stackPtr  The position of the current token in the
     *                                        stack passed in $tokens.
     *
     * @return void
     */
    public function process(PHP_CodeSniffer_File $phpcsFile, $stackPtr)
    {
        $tokens = $phpcsFile->getTokens();

        if (isset($tokens[$stackPtr]['scope_opener']) === false) {
            return;
        }

        $openingBrace = $tokens[$stackPtr]['scope_opener'];

        // The end of the function occurs at the end of the argument list. Its
        // like this because some people like to break long function declarations
        // over multiple lines.
        $functionLine = $tokens[$tokens[$stackPtr]['parenthesis_closer']]['line'];
        $braceLine    = $tokens[$openingBrace]['line'];

        $lineDifference = ($braceLine - $functionLine);

        if ($lineDifference === 0) {
            $error = 'Opening brace should be on a new line';
            $phpcsFile->addError($error, $openingBrace, 'BraceOnSameLine');
            return;
        }

        if ($lineDifference > 1) {
            $error = 'Opening brace should be on the line after the declaration; found %s blank line(s)';
            $data  = array(($lineDifference - 1));
            $phpcsFile->addError($error, $openingBrace, 'BraceSpacing', $data);
            return;
        }

        // We need to actually find the first piece of content on this line,
        // as if this is a method with tokens before it (public, static etc)
        // or an if with an else before it, then we need to start the scope
        // checking from there, rather than the current token.
        $lineStart = $stackPtr;
        while (($lineStart = $phpcsFile->findPrevious(array(T_WHITESPACE), ($lineStart - 1), null, false)) !== false) {
            if (strpos($tokens[$lineStart]['content'], $phpcsFile->eolChar) !== false) {
                break;
            }
        }

        // We found a new line, now go forward and find the first non-whitespace
        // token.
        $lineStart = $phpcsFile->findNext(array(T_WHITESPACE), $lineStart, null, true);

        // The opening brace is on the correct line, now it needs to be
        // checked to be correctly indented.
        $startColumn = $tokens[$lineStart]['column'];
        $braceIndent = $tokens[$openingBrace]['column'];

        if ($braceIndent !== $startColumn) {
            $error = 'Opening brace indented incorrectly; expected %s spaces, found %s';
            $data  = array(
                      ($startColumn - 1),
                      ($braceIndent - 1),
                     );
            $phpcsFile->addError($error, $openingBrace, 'BraceIndent', $data);
        }

    }//end process()


}//end class

?>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                <?php
/**
 * gmp extension Function dictionary for PHP_CompatInfo 1.9.0b2 or better
 *
 * PHP versions 4 and 5
 *
 * @category PHP
 * @package  PHP_CompatInfo
 * @author   Davey Shafik <davey@php.net>
 * @author   Laurent Laville <pear@laurent-laville.org>
 * @license  http://www.opensource.org/licenses/bsd-license.php  BSD
 * @version  CVS: $Id: gmp_func_array.php,v 1.1 2008/12/13 16:40:39 farell Exp $
 * @link     http://pear.php.net/package/PHP_CompatInfo
 * @since    version 1.9.0b2 (2008-12-19)
 */

$GLOBALS['_PHP_COMPATINFO_FUNC_GMP'] = array (
  'gmp_abs' =>
  array (
    'init' => '4.0.4',
    'ext' => 'gmp',
    'pecl' => false,
  ),
  'gmp_add' =>
  array (
    'init' => '4.0.4',
    'ext' => 'gmp',
    'pecl' => false,
  ),
  'gmp_and' =>
  array (
    'init' => '4.0.4',
    'ext' => 'gmp',
    'pecl' => false,
  ),
  'gmp_clrbit' =>
  array (
    'init' => '4.0.4',
    'ext' => 'gmp',
    'pecl' => false,
  ),
  'gmp_cmp' =>
  array (
    'init' => '4.0.4',
    'ext' => 'gmp',
    'pecl' => false,
  ),
  'gmp_com' =>
  array (
    'init' => '4.0.4',
    'ext' => 'gmp',
    'pecl' => false,
  ),
  'gmp_div' =>
  array (
    'init' => '4.0.4',
    'ext' => 'gmp',
    'pecl' => false,
  ),
  'gmp_div_q' =>
  array (
    'init' => '4.0.4',
    'ext' => 'gmp',
    'pecl' => false,
  ),
  'gmp_div_qr' =>
  array (
    'init' => '4.0.4',
    'ext' => 'gmp',
    'pecl' => false,
  ),
  'gmp_div_r' =>
  array (
    'init' => '4.0.4',
    'ext' => 'gmp',
    'pecl' => false,
  ),
  'gmp_divexact' =>
  array (
    'init' => '4.0.4',
    'ext' => 'gmp',
    'pecl' => false,
  ),
  'gmp_fact' =>
  array (
    'init' => '4.0.4',
    'ext' => 'gmp',
    'pecl' => false,
  ),
  'gmp_gcd' =>
  array (
    'init' => '4.0.4',
    'ext' => 'gmp',
    'pecl' => false,
  ),
  'gmp_gcdext' =>
  array (
    'init' => '4.0.4',
    'ext' => 'gmp',
    'pecl' => false,
  ),
  'gmp_hamdist' =>
  array (
    'init' => '4.0.4',
    'ext' => 'gmp',
    'pecl' => false,
  ),
  'gmp_init' =>
  array (
    'init' => '4.0.4',
    'ext' => 'gmp',
    'pecl' => false,
  ),
  'gmp_intval' =>
  array (
    'init' => '4.0.4',
    'ext' => 'gmp',
    'pecl' => false,
  ),
  'gmp_invert' =>
  array (
    'init' => '4.0.4',
    'ext' => 'gmp',
    'pecl' => false,
  ),
  'gmp_jacobi' =>
  array (
    'init' => '4.0.4',
    'ext' => 'gmp',
    'pecl' => false,
  ),
  'gmp_legendre' =>
  array (
    'init' => '4.0.4',
    'ext' => 'gmp',
    'pecl' => false,
  ),
  'gmp_mod' =>
  array (
    'init' => '4.0.4',
    'ext' => 'gmp',
    'pecl' => false,
  ),
  'gmp_mul' =>
  array (
    'init' => '4.0.4',
    'ext' => 'gmp',
    'pecl' => false,
  ),
  'gmp_neg' =>
  array (
    'init' => '4.0.4',
    'ext' => 'gmp',
    'pecl' => false,
  ),
  'gmp_nextprime' =>
  array (
    'init' => '5.2.0',
    'ext' => 'gmp',
    'pecl' => false,
  ),
  'gmp_or' =>
  array (
    'init' => '4.0.4',
    'ext' => 'gmp',
    'pecl' => false,
  ),
  'gmp_perfect_square' =>
  array (
    'init' => '4.0.4',
    'ext' => 'gmp',
    'pecl' => false,
  ),
  'gmp_popcount' =>
  array (
    'init' => '4.0.4',
    'ext' => 'gmp',
    'pecl' => false,
  ),
  'gmp_pow' =>
  array (
    'init' => '4.0.4',
    'ext' => 'gmp',
    'pecl' => false,
  ),
  'gmp_powm' =>
  array (
    'init' => '4.0.4',
    'ext' => 'gmp',
    'pecl' => false,
  ),
  'gmp_prob_prime' =>
  array (
    'init' => '4.0.4',
    'ext' => 'gmp',
    'pecl' => false,
  ),
  'gmp_random' =>
  array (
    'init' => '4.0.4',
    'ext' => 'gmp',
    'pecl' => false,
  ),
  'gmp_scan0' =>
  array (
    'init' => '4.0.4',
    'ext' => 'gmp',
    'pecl' => false,
  ),
  'gmp_scan1' =>
  array (
    'init' => '4.0.4',
    'ext' => 'gmp',
    'pecl' => false,
  ),
  'gmp_setbit' =>
  array (
    'init' => '4.0.4',
    'ext' => 'gmp',
    'pecl' => false,
  ),
  'gmp_sign' =>
  array (
    'init' => '4.0.4',
    'ext' => 'gmp',
    'pecl' => false,
  ),
  'gmp_sqrt' =>
  array (
    'init' => '4.0.4',
    'ext' => 'gmp',
    'pecl' => false,
  ),
  'gmp_sqrtrem' =>
  array (
    'init' => '4.0.4',
    'ext' => 'gmp',
    'pecl' => false,
  ),
  'gmp_strval' =>
  array (
    'init' => '4